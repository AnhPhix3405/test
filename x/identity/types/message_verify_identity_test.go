package types

import (
	"testing"

	"github.com/AnhPhix3405/test/testutil/sample"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/stretchr/testify/require"
)

func TestMsgVerifyIdentity_ValidateBasic(t *testing.T) {
	tests := []struct {
		name string
		msg  MsgVerifyIdentity
		err  error
	}{
		{
			name: "invalid address",
			msg: MsgVerifyIdentity{
				Creator: "invalid_address",
			},
			err: sdkerrors.ErrInvalidAddress,
		}, {
			name: "valid address",
			msg: MsgVerifyIdentity{
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
