package types

import (
	"fmt"
)

// DefaultIndex is the default global index
const DefaultIndex uint64 = 1

// DefaultGenesis returns the default genesis state
func DefaultGenesis() *GenesisState {
	return &GenesisState{
		IdentityList: []Identity{},
		// this line is used by starport scaffolding # genesis/types/default
		Params: DefaultParams(),
	}
}

// Validate performs basic genesis state validation returning an error upon any
// failure.
func (gs GenesisState) Validate() error {
	// Check for duplicated ID in identity
	identityIdMap := make(map[uint64]bool)
	identityCount := gs.GetIdentityCount()
	for _, elem := range gs.IdentityList {
		if _, ok := identityIdMap[elem.Id]; ok {
			return fmt.Errorf("duplicated id for identity")
		}
		if elem.Id >= identityCount {
			return fmt.Errorf("identity id should be lower or equal than the last id")
		}
		identityIdMap[elem.Id] = true
	}
	// this line is used by starport scaffolding # genesis/types/validate

	return gs.Params.Validate()
}
