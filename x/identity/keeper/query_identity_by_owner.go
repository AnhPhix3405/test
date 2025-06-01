package keeper

import (
    "context"

    sdk "github.com/cosmos/cosmos-sdk/types"
    "github.com/AnhPhix3405/test/x/identity/types"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
)

func (k Keeper) IdentityByOwner(goCtx context.Context, req *types.QueryIdentityByOwnerRequest) (*types.QueryIdentityByOwnerResponse, error) {
    if req == nil {
        return nil, status.Error(codes.InvalidArgument, "invalid request")
    }

    ctx := sdk.UnwrapSDKContext(goCtx)

    // Tìm kiếm identity theo owner
    identities := k.GetAllIdentity(ctx)
    for _, identity := range identities {
        if identity.Creator == req.Owner {
            return &types.QueryIdentityByOwnerResponse{Identity: &identity}, nil
        }
    }

    return nil, status.Error(codes.NotFound, "không tìm thấy định danh cho địa chỉ này")
}
