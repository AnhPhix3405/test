package identity

import (
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/AnhPhix3405/test/x/identity/keeper"
	"github.com/AnhPhix3405/test/x/identity/types"
)

// InitGenesis initializes the module's state from a provided genesis state.
func InitGenesis(ctx sdk.Context, k keeper.Keeper, genState types.GenesisState) {
	// Set all the identity
	for _, elem := range genState.IdentityList {
		k.SetIdentity(ctx, elem)
	}

	// Set identity count
	k.SetIdentityCount(ctx, genState.IdentityCount)
	// this line is used by starport scaffolding # genesis/module/init
	if err := k.SetParams(ctx, genState.Params); err != nil {
		panic(err)
	}
}

// ExportGenesis returns the module's exported genesis.
func ExportGenesis(ctx sdk.Context, k keeper.Keeper) *types.GenesisState {
	genesis := types.DefaultGenesis()
	genesis.Params = k.GetParams(ctx)

	genesis.IdentityList = k.GetAllIdentity(ctx)
	genesis.IdentityCount = k.GetIdentityCount(ctx)
	// this line is used by starport scaffolding # genesis/module/export

	return genesis
}
