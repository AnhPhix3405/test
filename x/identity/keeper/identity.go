package keeper

import (
	"context"
	"encoding/binary"

	"cosmossdk.io/store/prefix"
	storetypes "cosmossdk.io/store/types"
	"github.com/AnhPhix3405/test/x/identity/types"
	"github.com/cosmos/cosmos-sdk/runtime"
)

// GetIdentityCount get the total number of identity
func (k Keeper) GetIdentityCount(ctx context.Context) uint64 {
	storeAdapter := runtime.KVStoreAdapter(k.storeService.OpenKVStore(ctx))
	store := prefix.NewStore(storeAdapter, []byte{})
	byteKey := types.KeyPrefix(types.IdentityCountKey)
	bz := store.Get(byteKey)

	// Count doesn't exist: no element
	if bz == nil {
		return 0
	}

	// Parse bytes
	return binary.BigEndian.Uint64(bz)
}

// SetIdentityCount set the total number of identity
func (k Keeper) SetIdentityCount(ctx context.Context, count uint64) {
	storeAdapter := runtime.KVStoreAdapter(k.storeService.OpenKVStore(ctx))
	store := prefix.NewStore(storeAdapter, []byte{})
	byteKey := types.KeyPrefix(types.IdentityCountKey)
	bz := make([]byte, 8)
	binary.BigEndian.PutUint64(bz, count)
	store.Set(byteKey, bz)
}

// AppendIdentity appends a identity in the store with a new id and update the count
func (k Keeper) AppendIdentity(
	ctx context.Context,
	identity types.Identity,
) uint64 {
	// Create the identity
	count := k.GetIdentityCount(ctx)

	// Set the ID of the appended value
	identity.Id = count

	storeAdapter := runtime.KVStoreAdapter(k.storeService.OpenKVStore(ctx))
	store := prefix.NewStore(storeAdapter, types.KeyPrefix(types.IdentityKey))
	appendedValue := k.cdc.MustMarshal(&identity)
	store.Set(GetIdentityIDBytes(identity.Id), appendedValue)

	// Update identity count
	k.SetIdentityCount(ctx, count+1)

	return count
}

// SetIdentity set a specific identity in the store
func (k Keeper) SetIdentity(ctx context.Context, identity types.Identity) {
	storeAdapter := runtime.KVStoreAdapter(k.storeService.OpenKVStore(ctx))
	store := prefix.NewStore(storeAdapter, types.KeyPrefix(types.IdentityKey))
	b := k.cdc.MustMarshal(&identity)
	store.Set(GetIdentityIDBytes(identity.Id), b)
}

// GetIdentity returns a identity from its id
func (k Keeper) GetIdentity(ctx context.Context, id uint64) (val types.Identity, found bool) {
	storeAdapter := runtime.KVStoreAdapter(k.storeService.OpenKVStore(ctx))
	store := prefix.NewStore(storeAdapter, types.KeyPrefix(types.IdentityKey))
	b := store.Get(GetIdentityIDBytes(id))
	if b == nil {
		return val, false
	}
	k.cdc.MustUnmarshal(b, &val)
	return val, true
}

// RemoveIdentity removes a identity from the store
func (k Keeper) RemoveIdentity(ctx context.Context, id uint64) {
	storeAdapter := runtime.KVStoreAdapter(k.storeService.OpenKVStore(ctx))
	store := prefix.NewStore(storeAdapter, types.KeyPrefix(types.IdentityKey))
	store.Delete(GetIdentityIDBytes(id))
}

// GetAllIdentity returns all identity
func (k Keeper) GetAllIdentity(ctx context.Context) (list []types.Identity) {
	storeAdapter := runtime.KVStoreAdapter(k.storeService.OpenKVStore(ctx))
	store := prefix.NewStore(storeAdapter, types.KeyPrefix(types.IdentityKey))
	iterator := storetypes.KVStorePrefixIterator(store, []byte{})

	defer iterator.Close()

	for ; iterator.Valid(); iterator.Next() {
		var val types.Identity
		k.cdc.MustUnmarshal(iterator.Value(), &val)
		list = append(list, val)
	}

	return
}

// GetIdentityIDBytes returns the byte representation of the ID
func GetIdentityIDBytes(id uint64) []byte {
	bz := types.KeyPrefix(types.IdentityKey)
	bz = append(bz, []byte("/")...)
	bz = binary.BigEndian.AppendUint64(bz, id)
	return bz
}
