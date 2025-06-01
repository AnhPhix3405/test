package keeper_test

import (
	"context"
	"testing"

	keepertest "github.com/AnhPhix3405/test/testutil/keeper"
	"github.com/AnhPhix3405/test/testutil/nullify"
	"github.com/AnhPhix3405/test/x/identity/keeper"
	"github.com/AnhPhix3405/test/x/identity/types"
	"github.com/stretchr/testify/require"
)

func createNIdentity(keeper keeper.Keeper, ctx context.Context, n int) []types.Identity {
	items := make([]types.Identity, n)
	for i := range items {
		items[i].Id = keeper.AppendIdentity(ctx, items[i])
	}
	return items
}

func TestIdentityGet(t *testing.T) {
	keeper, ctx := keepertest.IdentityKeeper(t)
	items := createNIdentity(keeper, ctx, 10)
	for _, item := range items {
		got, found := keeper.GetIdentity(ctx, item.Id)
		require.True(t, found)
		require.Equal(t,
			nullify.Fill(&item),
			nullify.Fill(&got),
		)
	}
}

func TestIdentityRemove(t *testing.T) {
	keeper, ctx := keepertest.IdentityKeeper(t)
	items := createNIdentity(keeper, ctx, 10)
	for _, item := range items {
		keeper.RemoveIdentity(ctx, item.Id)
		_, found := keeper.GetIdentity(ctx, item.Id)
		require.False(t, found)
	}
}

func TestIdentityGetAll(t *testing.T) {
	keeper, ctx := keepertest.IdentityKeeper(t)
	items := createNIdentity(keeper, ctx, 10)
	require.ElementsMatch(t,
		nullify.Fill(items),
		nullify.Fill(keeper.GetAllIdentity(ctx)),
	)
}

func TestIdentityCount(t *testing.T) {
	keeper, ctx := keepertest.IdentityKeeper(t)
	items := createNIdentity(keeper, ctx, 10)
	count := uint64(len(items))
	require.Equal(t, count, keeper.GetIdentityCount(ctx))
}
