package types

import (
	errorsmod "cosmossdk.io/errors"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgVerifyIdentity{}

func NewMsgVerifyIdentity(creator string, identityId uint64, approve bool) *MsgVerifyIdentity {
	return &MsgVerifyIdentity{
		Creator:    creator,
		IdentityId: identityId,
		Approve:    approve,
	}
}

func (msg *MsgVerifyIdentity) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		return errorsmod.Wrapf(sdkerrors.ErrInvalidAddress, "invalid creator address (%s)", err)
	}
	return nil
}
