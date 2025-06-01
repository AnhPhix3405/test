package keeper_test

import (
	"testing"

	"github.com/stretchr/testify/require"

	keepertest "github.com/AnhPhix3405/test/testutil/keeper"
	"github.com/AnhPhix3405/test/x/identity/types"
)

func TestGetParams(t *testing.T) {
	k, ctx := keepertest.IdentityKeeper(t)
	params := types.DefaultParams()

	require.NoError(t, k.SetParams(ctx, params))
	require.EqualValues(t, params, k.GetParams(ctx))
}
