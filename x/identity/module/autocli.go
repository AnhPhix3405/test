package identity

import (
	autocliv1 "cosmossdk.io/api/cosmos/autocli/v1"

	modulev1 "github.com/AnhPhix3405/test/api/test/identity"
)

// AutoCLIOptions implements the autocli.HasAutoCLIConfig interface.
func (am AppModule) AutoCLIOptions() *autocliv1.ModuleOptions {
	return &autocliv1.ModuleOptions{
		Query: &autocliv1.ServiceCommandDescriptor{
			Service: modulev1.Query_ServiceDesc.ServiceName,
			RpcCommandOptions: []*autocliv1.RpcCommandOptions{
				{
					RpcMethod: "Params",
					Use:       "params",
					Short:     "Shows the parameters of the module",
				},
				{
					RpcMethod: "IdentityAll",
					Use:       "list-identity",
					Short:     "List all identity",
				},
				{
					RpcMethod:      "Identity",
					Use:            "show-identity [id]",
					Short:          "Shows a identity by id",
					PositionalArgs: []*autocliv1.PositionalArgDescriptor{{ProtoField: "id"}},
				},
				{
					RpcMethod:      "IdentityByNationalId",
					Use:            "identity-by-national-id [national-id-hash]",
					Short:          "Query identity-by-national-id",
					PositionalArgs: []*autocliv1.PositionalArgDescriptor{{ProtoField: "nationalIdHash"}},
				},

				{
					RpcMethod: "IdentityByOwner",
					Use: "identity-by-owner [owner]",
					Short: "Query identity-by-owner",
					PositionalArgs: []*autocliv1.PositionalArgDescriptor{{ProtoField: "owner"},},
				},

				{
					RpcMethod: "IdentityByOwner",
					Use: "identity-by-owner [owner]",
					Short: "Query identity-by-owner",
					PositionalArgs: []*autocliv1.PositionalArgDescriptor{{ProtoField: "owner"},},
				},

				// this line is used by ignite scaffolding # autocli/query
			},
		},
		Tx: &autocliv1.ServiceCommandDescriptor{
			Service:              modulev1.Msg_ServiceDesc.ServiceName,
			EnhanceCustomCommand: true, // only required if you want to use the custom command
			RpcCommandOptions: []*autocliv1.RpcCommandOptions{
				{
					RpcMethod: "UpdateParams",
					Skip:      true, // skipped because authority gated
				},
				{
					RpcMethod:      "CreateIdentity",
					Use:            "create-identity [fullName] [dateOfBirth] [nationalIdHash] [isVerified] [verifiedBy] [createdAt] [verifiedAt]",
					Short:          "Create identity",
					PositionalArgs: []*autocliv1.PositionalArgDescriptor{{ProtoField: "fullName"}, {ProtoField: "dateOfBirth"}, {ProtoField: "nationalIdHash"}, {ProtoField: "isVerified"}, {ProtoField: "verifiedBy"}, {ProtoField: "createdAt"}, {ProtoField: "verifiedAt"}},
				},
				{
					RpcMethod:      "UpdateIdentity",
					Use:            "update-identity [id] [fullName] [dateOfBirth] [nationalIdHash] [isVerified] [verifiedBy] [createdAt] [verifiedAt]",
					Short:          "Update identity",
					PositionalArgs: []*autocliv1.PositionalArgDescriptor{{ProtoField: "id"}, {ProtoField: "fullName"}, {ProtoField: "dateOfBirth"}, {ProtoField: "nationalIdHash"}, {ProtoField: "isVerified"}, {ProtoField: "verifiedBy"}, {ProtoField: "createdAt"}, {ProtoField: "verifiedAt"}},
				},
				{
					RpcMethod:      "DeleteIdentity",
					Use:            "delete-identity [id]",
					Short:          "Delete identity",
					PositionalArgs: []*autocliv1.PositionalArgDescriptor{{ProtoField: "id"}},
				},
				{
					RpcMethod:      "VerifyIdentity",
					Use:            "verify-identity [identity-id] [approve]",
					Short:          "Send a verify-identity tx",
					PositionalArgs: []*autocliv1.PositionalArgDescriptor{{ProtoField: "identityId"}, {ProtoField: "approve"}},
				},
				{
			RpcMethod: "RegisterIdentity",
			Use: "register-identity [full-name] [date-of-birth]",
			Short: "Send a register-identity tx",
			PositionalArgs: []*autocliv1.PositionalArgDescriptor{{ProtoField: "fullName"}, {ProtoField: "dateOfBirth"},},
		},
		// this line is used by ignite scaffolding # autocli/tx
			},
		},
	}
}
