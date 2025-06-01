package keeper_test

import (
	"testing"

	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/cosmos/cosmos-sdk/types/query"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	keepertest "github.com/AnhPhix3405/test/testutil/keeper"
	"github.com/AnhPhix3405/test/testutil/nullify"
	"github.com/AnhPhix3405/test/x/identity/types"
)

func TestIdentityQuerySingle(t *testing.T) {
	keeper, ctx := keepertest.IdentityKeeper(t)
	msgs := createNIdentity(keeper, ctx, 2)
	tests := []struct {
		desc     string
		request  *types.QueryGetIdentityRequest
		response *types.QueryGetIdentityResponse
		err      error
	}{
		{
			desc:     "First",
			request:  &types.QueryGetIdentityRequest{Id: msgs[0].Id},
			response: &types.QueryGetIdentityResponse{Identity: msgs[0]},
		},
		{
			desc:     "Second",
			request:  &types.QueryGetIdentityRequest{Id: msgs[1].Id},
			response: &types.QueryGetIdentityResponse{Identity: msgs[1]},
		},
		{
			desc:    "KeyNotFound",
			request: &types.QueryGetIdentityRequest{Id: uint64(len(msgs))},
			err:     sdkerrors.ErrKeyNotFound,
		},
		{
			desc: "InvalidRequest",
			err:  status.Error(codes.InvalidArgument, "invalid request"),
		},
	}
	for _, tc := range tests {
		t.Run(tc.desc, func(t *testing.T) {
			response, err := keeper.Identity(ctx, tc.request)
			if tc.err != nil {
				require.ErrorIs(t, err, tc.err)
			} else {
				require.NoError(t, err)
				require.Equal(t,
					nullify.Fill(tc.response),
					nullify.Fill(response),
				)
			}
		})
	}
}

func TestIdentityQueryPaginated(t *testing.T) {
	keeper, ctx := keepertest.IdentityKeeper(t)
	msgs := createNIdentity(keeper, ctx, 5)

	request := func(next []byte, offset, limit uint64, total bool) *types.QueryAllIdentityRequest {
		return &types.QueryAllIdentityRequest{
			Pagination: &query.PageRequest{
				Key:        next,
				Offset:     offset,
				Limit:      limit,
				CountTotal: total,
			},
		}
	}
	t.Run("ByOffset", func(t *testing.T) {
		step := 2
		for i := 0; i < len(msgs); i += step {
			resp, err := keeper.IdentityAll(ctx, request(nil, uint64(i), uint64(step), false))
			require.NoError(t, err)
			require.LessOrEqual(t, len(resp.Identity), step)
			require.Subset(t,
				nullify.Fill(msgs),
				nullify.Fill(resp.Identity),
			)
		}
	})
	t.Run("ByKey", func(t *testing.T) {
		step := 2
		var next []byte
		for i := 0; i < len(msgs); i += step {
			resp, err := keeper.IdentityAll(ctx, request(next, 0, uint64(step), false))
			require.NoError(t, err)
			require.LessOrEqual(t, len(resp.Identity), step)
			require.Subset(t,
				nullify.Fill(msgs),
				nullify.Fill(resp.Identity),
			)
			next = resp.Pagination.NextKey
		}
	})
	t.Run("Total", func(t *testing.T) {
		resp, err := keeper.IdentityAll(ctx, request(nil, 0, 0, true))
		require.NoError(t, err)
		require.Equal(t, len(msgs), int(resp.Pagination.Total))
		require.ElementsMatch(t,
			nullify.Fill(msgs),
			nullify.Fill(resp.Identity),
		)
	})
	t.Run("InvalidRequest", func(t *testing.T) {
		_, err := keeper.IdentityAll(ctx, nil)
		require.ErrorIs(t, err, status.Error(codes.InvalidArgument, "invalid request"))
	})
}
