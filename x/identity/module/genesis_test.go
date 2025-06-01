package identity_test

import (
	"testing"

	keepertest "github.com/AnhPhix3405/test/testutil/keeper"
	"github.com/AnhPhix3405/test/testutil/nullify"
	identity "github.com/AnhPhix3405/test/x/identity/module"
	"github.com/AnhPhix3405/test/x/identity/types"
	"github.com/stretchr/testify/require"
)

func TestGenesis(t *testing.T) {
	genesisState := types.GenesisState{
		Params: types.DefaultParams(),

		IdentityList: []types.Identity{
			{
				Id: 0,
			},
			{
				Id: 1,
			},
		},
		IdentityCount: 2,
		// this line is used by starport scaffolding # genesis/test/state
	}

	k, ctx := keepertest.IdentityKeeper(t)
	identity.InitGenesis(ctx, k, genesisState)
	got := identity.ExportGenesis(ctx, k)
	require.NotNil(t, got)

	nullify.Fill(&genesisState)
	nullify.Fill(got)

	require.ElementsMatch(t, genesisState.IdentityList, got.IdentityList)
	require.Equal(t, genesisState.IdentityCount, got.IdentityCount)
	// this line is used by starport scaffolding # genesis/test/assert
}
