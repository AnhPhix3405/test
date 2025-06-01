package keeper

import (
    "context"

    sdk "github.com/cosmos/cosmos-sdk/types"
    "github.com/AnhPhix3405/test/x/identity/types"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
)

func (k Keeper) IdentityByNationalId(goCtx context.Context, req *types.QueryIdentityByNationalIdRequest) (*types.QueryIdentityByNationalIdResponse, error) {
    if req == nil {
        return nil, status.Error(codes.InvalidArgument, "invalid request")
    }

    ctx := sdk.UnwrapSDKContext(goCtx)

    // Tìm kiếm identity theo national ID hash
    identities := k.GetAllIdentity(ctx)
    for _, identity := range identities {
        if identity.NationalIdHash == req.NationalIdHash {
            return &types.QueryIdentityByNationalIdResponse{Identity: &identity}, nil
        }
    }

    return nil, status.Error(codes.NotFound, "không tìm thấy định danh cho CCCD/CMND này")
}
