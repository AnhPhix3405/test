package keeper

import (
    "context"
    "crypto/sha256"
    "fmt"
    "time"
    "regexp"

    errorsmod "cosmossdk.io/errors"
    sdk "github.com/cosmos/cosmos-sdk/types"
    sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
    "github.com/AnhPhix3405/test/x/identity/types"
)

func (k msgServer) RegisterIdentity(goCtx context.Context, msg *types.MsgRegisterIdentity) (*types.MsgRegisterIdentityResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // Validate input theo chuẩn Việt Nam
    if err := validateVietnameseIdentity(msg.FullName, msg.DateOfBirth, msg.NationalId); err != nil {
        return nil, err
    }

    // Check if user already has an identity
    allIdentities := k.GetAllIdentity(ctx)
    for _, identity := range allIdentities {
        if identity.Creator == msg.Creator {
            return nil, errorsmod.Wrap(sdkerrors.ErrInvalidRequest, "user already has an identity")
        }
    }

    // Hash national ID with SHA-256
    hash := sha256.Sum256([]byte(msg.NationalId))
    nationalIdHash := fmt.Sprintf("%x", hash)

    // Check if national ID already exists
    for _, identity := range allIdentities {
        if identity.NationalIdHash == nationalIdHash {
            return nil, errorsmod.Wrap(sdkerrors.ErrInvalidRequest, "national ID already registered")
        }
    }

    // Create new identity
    identity := types.Identity{
        Creator:        msg.Creator,
        FullName:       msg.FullName,
        DateOfBirth:    msg.DateOfBirth,
        NationalIdHash: nationalIdHash,
        IsVerified:     false,
        VerifiedBy:     "",
        CreatedAt:      int32(time.Now().Unix()), // Convert int64 to int32
        VerifiedAt:     0,
    }

    id := k.AppendIdentity(ctx, identity)

    // Emit event
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(
            "identity_registered",
            sdk.NewAttribute("id", fmt.Sprintf("%d", id)),
            sdk.NewAttribute("creator", msg.Creator),
            sdk.NewAttribute("full_name", msg.FullName),
        ),
    )

    return &types.MsgRegisterIdentityResponse{}, nil // Xóa field Id không tồn tại
}

// validateVietnameseIdentity validates input theo chuẩn Việt Nam
func validateVietnameseIdentity(fullName, dateOfBirth, nationalId string) error {
    // Validate full name (ít nhất 2 ký tự, cho phép tiếng Việt có dấu)
    if len(fullName) < 2 {
        return errorsmod.Wrap(sdkerrors.ErrInvalidRequest, "tên phải có ít nhất 2 ký tự")
    }

    // Validate date of birth format YYYY-MM-DD
    dateRegex := regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)
    if !dateRegex.MatchString(dateOfBirth) {
        return errorsmod.Wrap(sdkerrors.ErrInvalidRequest, "ngày sinh phải theo định dạng YYYY-MM-DD")
    }

    // Parse date để đảm bảo hợp lệ
    parsedDate, err := time.Parse("2006-01-02", dateOfBirth)
    if err != nil {
        return errorsmod.Wrap(sdkerrors.ErrInvalidRequest, "ngày sinh không hợp lệ")
    }

    // Kiểm tra tuổi hợp lý (từ 16 đến 100 tuổi)
    now := time.Now()
    age := now.Year() - parsedDate.Year()
    if age < 16 || age > 100 {
        return errorsmod.Wrap(sdkerrors.ErrInvalidRequest, "tuổi phải từ 16 đến 100")
    }

    // Validate national ID (CCCD: 12 số, CMND: 9 số)
    if len(nationalId) != 9 && len(nationalId) != 12 {
        return errorsmod.Wrap(sdkerrors.ErrInvalidRequest, "CMND phải có 9 số hoặc CCCD phải có 12 số")
    }

    // Kiểm tra chỉ chứa số
    digitRegex := regexp.MustCompile(`^\d+$`)
    if !digitRegex.MatchString(nationalId) {
        return errorsmod.Wrap(sdkerrors.ErrInvalidRequest, "CMND/CCCD chỉ được chứa số")
    }

    // Validate mã tỉnh/thành phố cho CCCD 12 số
    if len(nationalId) == 12 {
        provinceCode := nationalId[:3]
        if !isValidProvinceCode(provinceCode) {
            return errorsmod.Wrap(sdkerrors.ErrInvalidRequest, "mã tỉnh/thành phố trong CCCD không hợp lệ")
        }
    }

    return nil
}

// isValidProvinceCode kiểm tra mã tỉnh/thành phố Việt Nam
func isValidProvinceCode(code string) bool {
    validCodes := map[string]bool{
        "001": true, // Hà Nội
        "002": true, // Hà Giang
        "004": true, // Cao Bằng
        "006": true, // Bắc Kạn
        "008": true, // Tuyên Quang
        "010": true, // Lào Cai
        "011": true, // Điện Biên
        "012": true, // Lai Châu
        "014": true, // Sơn La
        "015": true, // Yên Bái
        "017": true, // Hoà Bình
        "019": true, // Thái Nguyên
        "020": true, // Lạng Sơn
        "022": true, // Quảng Ninh
        "024": true, // Bắc Giang
        "025": true, // Phú Thọ
        "026": true, // Vĩnh Phúc
        "027": true, // Bắc Ninh
        "030": true, // Hải Dương
        "031": true, // Hải Phòng
        "033": true, // Hưng Yên
        "034": true, // Thái Bình
        "035": true, // Hà Nam
        "036": true, // Nam Định
        "037": true, // Ninh Bình
        "038": true, // Thanh Hóa
        "040": true, // Nghệ An
        "042": true, // Hà Tĩnh
        "044": true, // Quảng Bình
        "045": true, // Quảng Trị
        "046": true, // Thừa Thiên Huế
        "048": true, // Đà Nẵng
        "049": true, // Quảng Nam
        "051": true, // Quảng Ngãi
        "052": true, // Bình Định
        "054": true, // Phú Yên
        "056": true, // Khánh Hòa
        "058": true, // Ninh Thuận
        "060": true, // Bình Thuận
        "062": true, // Kon Tum
        "064": true, // Gia Lai
        "066": true, // Đắk Lắk
        "067": true, // Đắk Nông
        "068": true, // Lâm Đồng
        "070": true, // Bình Phước
        "072": true, // Tây Ninh
        "074": true, // Bình Dương
        "075": true, // Đồng Nai
        "077": true, // Bà Rịa - Vũng Tàu
        "079": true, // TP. Hồ Chí Minh
        "080": true, // Long An
        "082": true, // Tiền Giang
        "083": true, // Bến Tre
        "084": true, // Trà Vinh
        "086": true, // Vĩnh Long
        "087": true, // Đồng Tháp
        "089": true, // An Giang
        "091": true, // Kiên Giang
        "092": true, // Cần Thơ
        "093": true, // Hậu Giang
        "094": true, // Sóc Trăng
        "095": true, // Bạc Liêu
        "096": true, // Cà Mau
    }
    return validCodes[code]
}
