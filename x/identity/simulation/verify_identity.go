package simulation

import (
	"math/rand"

	"github.com/AnhPhix3405/test/x/identity/keeper"
	"github.com/AnhPhix3405/test/x/identity/types"
	"github.com/cosmos/cosmos-sdk/baseapp"
	sdk "github.com/cosmos/cosmos-sdk/types"
	simtypes "github.com/cosmos/cosmos-sdk/types/simulation"
)

func SimulateMsgVerifyIdentity(
	ak types.AccountKeeper,
	bk types.BankKeeper,
	k keeper.Keeper,
) simtypes.Operation {
	return func(r *rand.Rand, app *baseapp.BaseApp, ctx sdk.Context, accs []simtypes.Account, chainID string,
	) (simtypes.OperationMsg, []simtypes.FutureOperation, error) {
		simAccount, _ := simtypes.RandomAcc(r, accs)
		msg := &types.MsgVerifyIdentity{
			Creator: simAccount.Address.String(),
		}

		// TODO: Handling the VerifyIdentity simulation

		return simtypes.NoOpMsg(types.ModuleName, sdk.MsgTypeURL(msg), "VerifyIdentity simulation not implemented"), nil, nil
	}
}
