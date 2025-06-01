package identity

import (
	"math/rand"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"
	simtypes "github.com/cosmos/cosmos-sdk/types/simulation"
	"github.com/cosmos/cosmos-sdk/x/simulation"

	"github.com/AnhPhix3405/test/testutil/sample"
	identitysimulation "github.com/AnhPhix3405/test/x/identity/simulation"
	"github.com/AnhPhix3405/test/x/identity/types"
)

// avoid unused import issue
var (
	_ = identitysimulation.FindAccount
	_ = rand.Rand{}
	_ = sample.AccAddress
	_ = sdk.AccAddress{}
	_ = simulation.MsgEntryKind
)

const (
	opWeightMsgCreateIdentity = "op_weight_msg_identity"
	// TODO: Determine the simulation weight value
	defaultWeightMsgCreateIdentity int = 100

	opWeightMsgUpdateIdentity = "op_weight_msg_identity"
	// TODO: Determine the simulation weight value
	defaultWeightMsgUpdateIdentity int = 100

	opWeightMsgDeleteIdentity = "op_weight_msg_identity"
	// TODO: Determine the simulation weight value
	defaultWeightMsgDeleteIdentity int = 100

	opWeightMsgVerifyIdentity = "op_weight_msg_verify_identity"
	// TODO: Determine the simulation weight value
	defaultWeightMsgVerifyIdentity int = 100

	opWeightMsgRegisterIdentity = "op_weight_msg_register_identity"
	// TODO: Determine the simulation weight value
	defaultWeightMsgRegisterIdentity int = 100

	// this line is used by starport scaffolding # simapp/module/const
)

// GenerateGenesisState creates a randomized GenState of the module.
func (AppModule) GenerateGenesisState(simState *module.SimulationState) {
	accs := make([]string, len(simState.Accounts))
	for i, acc := range simState.Accounts {
		accs[i] = acc.Address.String()
	}
	identityGenesis := types.GenesisState{
		Params: types.DefaultParams(),
		IdentityList: []types.Identity{
			{
				Id:      0,
				Creator: sample.AccAddress(),
			},
			{
				Id:      1,
				Creator: sample.AccAddress(),
			},
		},
		IdentityCount: 2,
		// this line is used by starport scaffolding # simapp/module/genesisState
	}
	simState.GenState[types.ModuleName] = simState.Cdc.MustMarshalJSON(&identityGenesis)
}

// RegisterStoreDecoder registers a decoder.
func (am AppModule) RegisterStoreDecoder(_ simtypes.StoreDecoderRegistry) {}

// WeightedOperations returns the all the gov module operations with their respective weights.
func (am AppModule) WeightedOperations(simState module.SimulationState) []simtypes.WeightedOperation {
	operations := make([]simtypes.WeightedOperation, 0)

	var weightMsgCreateIdentity int
	simState.AppParams.GetOrGenerate(opWeightMsgCreateIdentity, &weightMsgCreateIdentity, nil,
		func(_ *rand.Rand) {
			weightMsgCreateIdentity = defaultWeightMsgCreateIdentity
		},
	)
	operations = append(operations, simulation.NewWeightedOperation(
		weightMsgCreateIdentity,
		identitysimulation.SimulateMsgCreateIdentity(am.accountKeeper, am.bankKeeper, am.keeper),
	))

	var weightMsgUpdateIdentity int
	simState.AppParams.GetOrGenerate(opWeightMsgUpdateIdentity, &weightMsgUpdateIdentity, nil,
		func(_ *rand.Rand) {
			weightMsgUpdateIdentity = defaultWeightMsgUpdateIdentity
		},
	)
	operations = append(operations, simulation.NewWeightedOperation(
		weightMsgUpdateIdentity,
		identitysimulation.SimulateMsgUpdateIdentity(am.accountKeeper, am.bankKeeper, am.keeper),
	))

	var weightMsgDeleteIdentity int
	simState.AppParams.GetOrGenerate(opWeightMsgDeleteIdentity, &weightMsgDeleteIdentity, nil,
		func(_ *rand.Rand) {
			weightMsgDeleteIdentity = defaultWeightMsgDeleteIdentity
		},
	)
	operations = append(operations, simulation.NewWeightedOperation(
		weightMsgDeleteIdentity,
		identitysimulation.SimulateMsgDeleteIdentity(am.accountKeeper, am.bankKeeper, am.keeper),
	))

	var weightMsgVerifyIdentity int
	simState.AppParams.GetOrGenerate(opWeightMsgVerifyIdentity, &weightMsgVerifyIdentity, nil,
		func(_ *rand.Rand) {
			weightMsgVerifyIdentity = defaultWeightMsgVerifyIdentity
		},
	)
	operations = append(operations, simulation.NewWeightedOperation(
		weightMsgVerifyIdentity,
		identitysimulation.SimulateMsgVerifyIdentity(am.accountKeeper, am.bankKeeper, am.keeper),
	))

	var weightMsgRegisterIdentity int
	simState.AppParams.GetOrGenerate(opWeightMsgRegisterIdentity, &weightMsgRegisterIdentity, nil,
		func(_ *rand.Rand) {
			weightMsgRegisterIdentity = defaultWeightMsgRegisterIdentity
		},
	)
	operations = append(operations, simulation.NewWeightedOperation(
		weightMsgRegisterIdentity,
		identitysimulation.SimulateMsgRegisterIdentity(am.accountKeeper, am.bankKeeper, am.keeper),
	))

	// this line is used by starport scaffolding # simapp/module/operation

	return operations
}

// ProposalMsgs returns msgs used for governance proposals for simulations.
func (am AppModule) ProposalMsgs(simState module.SimulationState) []simtypes.WeightedProposalMsg {
	return []simtypes.WeightedProposalMsg{
		simulation.NewWeightedProposalMsg(
			opWeightMsgCreateIdentity,
			defaultWeightMsgCreateIdentity,
			func(r *rand.Rand, ctx sdk.Context, accs []simtypes.Account) sdk.Msg {
				identitysimulation.SimulateMsgCreateIdentity(am.accountKeeper, am.bankKeeper, am.keeper)
				return nil
			},
		),
		simulation.NewWeightedProposalMsg(
			opWeightMsgUpdateIdentity,
			defaultWeightMsgUpdateIdentity,
			func(r *rand.Rand, ctx sdk.Context, accs []simtypes.Account) sdk.Msg {
				identitysimulation.SimulateMsgUpdateIdentity(am.accountKeeper, am.bankKeeper, am.keeper)
				return nil
			},
		),
		simulation.NewWeightedProposalMsg(
			opWeightMsgDeleteIdentity,
			defaultWeightMsgDeleteIdentity,
			func(r *rand.Rand, ctx sdk.Context, accs []simtypes.Account) sdk.Msg {
				identitysimulation.SimulateMsgDeleteIdentity(am.accountKeeper, am.bankKeeper, am.keeper)
				return nil
			},
		),
		simulation.NewWeightedProposalMsg(
			opWeightMsgVerifyIdentity,
			defaultWeightMsgVerifyIdentity,
			func(r *rand.Rand, ctx sdk.Context, accs []simtypes.Account) sdk.Msg {
				identitysimulation.SimulateMsgVerifyIdentity(am.accountKeeper, am.bankKeeper, am.keeper)
				return nil
			},
		),
		simulation.NewWeightedProposalMsg(
	opWeightMsgRegisterIdentity,
	defaultWeightMsgRegisterIdentity,
	func(r *rand.Rand, ctx sdk.Context, accs []simtypes.Account) sdk.Msg {
		identitysimulation.SimulateMsgRegisterIdentity(am.accountKeeper, am.bankKeeper, am.keeper)
		return nil
	},
),
// this line is used by starport scaffolding # simapp/module/OpMsg
	}
}
