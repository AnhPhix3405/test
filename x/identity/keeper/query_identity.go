package keeper

import (
	"context"

	"cosmossdk.io/store/prefix"
	"github.com/AnhPhix3405/test/x/identity/types"
	"github.com/cosmos/cosmos-sdk/runtime"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/cosmos/cosmos-sdk/types/query"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (k Keeper) IdentityAll(ctx context.Context, req *types.QueryAllIdentityRequest) (*types.QueryAllIdentityResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "invalid request")
	}

	var identitys []types.Identity

	store := runtime.KVStoreAdapter(k.storeService.OpenKVStore(ctx))
	identityStore := prefix.NewStore(store, types.KeyPrefix(types.IdentityKey))

	pageRes, err := query.Paginate(identityStore, req.Pagination, func(key []byte, value []byte) error {
		var identity types.Identity
		if err := k.cdc.Unmarshal(value, &identity); err != nil {
			return err
		}

		identitys = append(identitys, identity)
		return nil
	})

	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return &types.QueryAllIdentityResponse{Identity: identitys, Pagination: pageRes}, nil
}

func (k Keeper) Identity(ctx context.Context, req *types.QueryGetIdentityRequest) (*types.QueryGetIdentityResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "invalid request")
	}

	identity, found := k.GetIdentity(ctx, req.Id)
	if !found {
		return nil, sdkerrors.ErrKeyNotFound
	}

	return &types.QueryGetIdentityResponse{Identity: identity}, nil
}
