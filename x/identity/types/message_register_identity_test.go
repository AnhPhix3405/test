package types

import (
	"testing"

	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/stretchr/testify/require"
	"github.com/AnhPhix3405/test/testutil/sample"
)

func TestMsgRegisterIdentity_ValidateBasic(t *testing.T) {
	tests := []struct {
		name string
		msg  MsgRegisterIdentity
		err  error
	}{
		{
			name: "invalid address",
			msg: MsgRegisterIdentity{
				Creator: "invalid_address",
			},
			err: sdkerrors.ErrInvalidAddress,
		}, {
			name: "valid address",
			msg: MsgRegisterIdentity{
				Creator: sample.AccAddress(),
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.msg.ValidateBasic()
			if tt.err != nil {
				require.ErrorIs(t, err, tt.err)
				return
			}
			require.NoError(t, err)
		})
	}
}
