package keeper

import (
    "context"
    "fmt"
    "time"

    errorsmod "cosmossdk.io/errors"
    sdk "github.com/cosmos/cosmos-sdk/types"
    sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
    "github.com/AnhPhix3405/test/x/identity/types"
)

func (k msgServer) VerifyIdentity(goCtx context.Context, msg *types.MsgVerifyIdentity) (*types.MsgVerifyIdentityResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // Get identity
    identity, found := k.GetIdentity(ctx, msg.IdentityId)
    if !found {
        return nil, errorsmod.Wrap(sdkerrors.ErrKeyNotFound, "không tìm thấy định danh")
    }

    // Check if already verified
    if identity.IsVerified {
        return nil, errorsmod.Wrap(sdkerrors.ErrInvalidRequest, "định danh đã được xác minh")
    }

    // TODO: Add authority check here (only authorized verifiers can verify)
    // For now, any address can verify (you can add whitelist later)

    // Update verification status
    if msg.Approve {
        identity.IsVerified = true
        identity.VerifiedBy = msg.Creator
        identity.VerifiedAt = int32(time.Now().Unix()) // Convert int64 to int32
    }

    k.SetIdentity(ctx, identity)

    // Emit event
    status := "rejected"
    if msg.Approve {
        status = "verified"
    }
    
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(
            "identity_verification",
            sdk.NewAttribute("id", fmt.Sprintf("%d", msg.IdentityId)),
            sdk.NewAttribute("verifier", msg.Creator),
            sdk.NewAttribute("status", status),
        ),
    )

    return &types.MsgVerifyIdentityResponse{}, nil
}
