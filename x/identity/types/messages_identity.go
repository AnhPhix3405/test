package types

import (
    errorsmod "cosmossdk.io/errors"
    sdk "github.com/cosmos/cosmos-sdk/types"
    sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgCreateIdentity{}

func NewMsgCreateIdentity(creator string, fullName string, dateOfBirth string, nationalIdHash string, isVerified bool, verifiedBy string, createdAt int32, verifiedAt int32) *MsgCreateIdentity {
    return &MsgCreateIdentity{
        Creator:        creator,
        FullName:       fullName,
        DateOfBirth:    dateOfBirth,
        NationalIdHash: nationalIdHash,
        IsVerified:     isVerified,
        VerifiedBy:     verifiedBy,
        CreatedAt:      createdAt,
        VerifiedAt:     verifiedAt,
    }
}

func (msg *MsgCreateIdentity) ValidateBasic() error {
    _, err := sdk.AccAddressFromBech32(msg.Creator)
    if err != nil {
        return errorsmod.Wrapf(sdkerrors.ErrInvalidAddress, "invalid creator address (%s)", err)
    }
    return nil
}

var _ sdk.Msg = &MsgUpdateIdentity{}

func NewMsgUpdateIdentity(creator string, id uint64, fullName string, dateOfBirth string, nationalIdHash string, isVerified bool, verifiedBy string, createdAt int32, verifiedAt int32) *MsgUpdateIdentity {
    return &MsgUpdateIdentity{
        Id:             id,
        Creator:        creator,
        FullName:       fullName,
        DateOfBirth:    dateOfBirth,
        NationalIdHash: nationalIdHash,
        IsVerified:     isVerified,
        VerifiedBy:     verifiedBy,
        CreatedAt:      createdAt,
        VerifiedAt:     verifiedAt,
    }
}

func (msg *MsgUpdateIdentity) ValidateBasic() error {
    _, err := sdk.AccAddressFromBech32(msg.Creator)
    if err != nil {
        return errorsmod.Wrapf(sdkerrors.ErrInvalidAddress, "invalid creator address (%s)", err)
    }
    return nil
}

var _ sdk.Msg = &MsgDeleteIdentity{}

func NewMsgDeleteIdentity(creator string, id uint64) *MsgDeleteIdentity {
    return &MsgDeleteIdentity{
        Id:      id,
        Creator: creator,
    }
}

func (msg *MsgDeleteIdentity) ValidateBasic() error {
    _, err := sdk.AccAddressFromBech32(msg.Creator)
    if err != nil {
        return errorsmod.Wrapf(sdkerrors.ErrInvalidAddress, "invalid creator address (%s)", err)
    }
    return nil
}
