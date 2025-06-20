// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: test/identity/identity.proto

package types

import (
	fmt "fmt"
	proto "github.com/cosmos/gogoproto/proto"
	io "io"
	math "math"
	math_bits "math/bits"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.GoGoProtoPackageIsVersion3 // please upgrade the proto package

type Identity struct {
	Id             uint64 `protobuf:"varint,1,opt,name=id,proto3" json:"id,omitempty"`
	FullName       string `protobuf:"bytes,2,opt,name=fullName,proto3" json:"fullName,omitempty"`
	DateOfBirth    string `protobuf:"bytes,3,opt,name=dateOfBirth,proto3" json:"dateOfBirth,omitempty"`
	NationalIdHash string `protobuf:"bytes,4,opt,name=nationalIdHash,proto3" json:"nationalIdHash,omitempty"`
	IsVerified     bool   `protobuf:"varint,5,opt,name=isVerified,proto3" json:"isVerified,omitempty"`
	VerifiedBy     string `protobuf:"bytes,6,opt,name=verifiedBy,proto3" json:"verifiedBy,omitempty"`
	CreatedAt      int32  `protobuf:"varint,7,opt,name=createdAt,proto3" json:"createdAt,omitempty"`
	VerifiedAt     int32  `protobuf:"varint,8,opt,name=verifiedAt,proto3" json:"verifiedAt,omitempty"`
	Creator        string `protobuf:"bytes,9,opt,name=creator,proto3" json:"creator,omitempty"`
}

func (m *Identity) Reset()         { *m = Identity{} }
func (m *Identity) String() string { return proto.CompactTextString(m) }
func (*Identity) ProtoMessage()    {}
func (*Identity) Descriptor() ([]byte, []int) {
	return fileDescriptor_056d07701dd54e1b, []int{0}
}
func (m *Identity) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *Identity) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_Identity.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *Identity) XXX_Merge(src proto.Message) {
	xxx_messageInfo_Identity.Merge(m, src)
}
func (m *Identity) XXX_Size() int {
	return m.Size()
}
func (m *Identity) XXX_DiscardUnknown() {
	xxx_messageInfo_Identity.DiscardUnknown(m)
}

var xxx_messageInfo_Identity proto.InternalMessageInfo

func (m *Identity) GetId() uint64 {
	if m != nil {
		return m.Id
	}
	return 0
}

func (m *Identity) GetFullName() string {
	if m != nil {
		return m.FullName
	}
	return ""
}

func (m *Identity) GetDateOfBirth() string {
	if m != nil {
		return m.DateOfBirth
	}
	return ""
}

func (m *Identity) GetNationalIdHash() string {
	if m != nil {
		return m.NationalIdHash
	}
	return ""
}

func (m *Identity) GetIsVerified() bool {
	if m != nil {
		return m.IsVerified
	}
	return false
}

func (m *Identity) GetVerifiedBy() string {
	if m != nil {
		return m.VerifiedBy
	}
	return ""
}

func (m *Identity) GetCreatedAt() int32 {
	if m != nil {
		return m.CreatedAt
	}
	return 0
}

func (m *Identity) GetVerifiedAt() int32 {
	if m != nil {
		return m.VerifiedAt
	}
	return 0
}

func (m *Identity) GetCreator() string {
	if m != nil {
		return m.Creator
	}
	return ""
}

func init() {
	proto.RegisterType((*Identity)(nil), "test.identity.Identity")
}

func init() { proto.RegisterFile("test/identity/identity.proto", fileDescriptor_056d07701dd54e1b) }

var fileDescriptor_056d07701dd54e1b = []byte{
	// 288 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x5c, 0x90, 0x3b, 0x4e, 0xc3, 0x40,
	0x10, 0x86, 0xb3, 0x26, 0x0f, 0x7b, 0x11, 0x29, 0xb6, 0x5a, 0xa1, 0x68, 0x65, 0x51, 0x20, 0x17,
	0xc8, 0x46, 0x0a, 0x1c, 0xc0, 0x2e, 0x10, 0x69, 0x00, 0xb9, 0xa0, 0xa0, 0xdb, 0x64, 0xd7, 0x78,
	0x24, 0xc7, 0x8e, 0xec, 0x09, 0x8a, 0x6f, 0x41, 0xc9, 0x91, 0x28, 0x53, 0x52, 0x22, 0xfb, 0x22,
	0x28, 0xab, 0x3c, 0x2c, 0xba, 0xf9, 0xbf, 0x6f, 0x66, 0x8a, 0x9f, 0x4e, 0x50, 0x57, 0x18, 0x80,
	0xd2, 0x39, 0x02, 0xd6, 0xc7, 0xc1, 0x5f, 0x95, 0x05, 0x16, 0xec, 0x62, 0x67, 0xfd, 0x03, 0xbc,
	0xfa, 0xb2, 0xa8, 0x3d, 0xdb, 0x07, 0x36, 0xa6, 0x16, 0x28, 0x4e, 0x5c, 0xe2, 0xf5, 0x63, 0x0b,
	0x14, 0xbb, 0xa4, 0x76, 0xb2, 0xce, 0xb2, 0x27, 0xb9, 0xd4, 0xdc, 0x72, 0x89, 0xe7, 0xc4, 0xc7,
	0xcc, 0x5c, 0x7a, 0xae, 0x24, 0xea, 0xe7, 0x24, 0x82, 0x12, 0x53, 0x7e, 0x66, 0x74, 0x17, 0xb1,
	0x6b, 0x3a, 0xce, 0x25, 0x42, 0x91, 0xcb, 0x6c, 0xa6, 0x1e, 0x65, 0x95, 0xf2, 0xbe, 0x59, 0xfa,
	0x47, 0x99, 0xa0, 0x14, 0xaa, 0x57, 0x5d, 0x42, 0x02, 0x5a, 0xf1, 0x81, 0x4b, 0x3c, 0x3b, 0xee,
	0x90, 0x9d, 0xff, 0xd8, 0xcf, 0x51, 0xcd, 0x87, 0xe6, 0x47, 0x87, 0xb0, 0x09, 0x75, 0x16, 0xa5,
	0x96, 0xa8, 0x55, 0x88, 0x7c, 0xe4, 0x12, 0x6f, 0x10, 0x9f, 0x40, 0xf7, 0x3a, 0x44, 0x6e, 0x1b,
	0xdd, 0x21, 0x8c, 0xd3, 0x91, 0x59, 0x2e, 0x4a, 0xee, 0x98, 0xd7, 0x87, 0x18, 0x3d, 0x7c, 0x37,
	0x82, 0x6c, 0x1b, 0x41, 0x7e, 0x1b, 0x41, 0x3e, 0x5b, 0xd1, 0xdb, 0xb6, 0xa2, 0xf7, 0xd3, 0x8a,
	0xde, 0xdb, 0xcd, 0x3b, 0x60, 0xba, 0x9e, 0xfb, 0x8b, 0x62, 0x19, 0x84, 0x79, 0xfa, 0x92, 0xc2,
	0x66, 0x7a, 0x77, 0x7b, 0x1f, 0x98, 0xe2, 0x37, 0xa7, 0xea, 0xb1, 0x5e, 0xe9, 0x6a, 0x3e, 0x34,
	0xc5, 0x4f, 0xff, 0x02, 0x00, 0x00, 0xff, 0xff, 0x1d, 0x21, 0x68, 0xe7, 0x98, 0x01, 0x00, 0x00,
}

func (m *Identity) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalToSizedBuffer(dAtA[:size])
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *Identity) MarshalTo(dAtA []byte) (int, error) {
	size := m.Size()
	return m.MarshalToSizedBuffer(dAtA[:size])
}

func (m *Identity) MarshalToSizedBuffer(dAtA []byte) (int, error) {
	i := len(dAtA)
	_ = i
	var l int
	_ = l
	if len(m.Creator) > 0 {
		i -= len(m.Creator)
		copy(dAtA[i:], m.Creator)
		i = encodeVarintIdentity(dAtA, i, uint64(len(m.Creator)))
		i--
		dAtA[i] = 0x4a
	}
	if m.VerifiedAt != 0 {
		i = encodeVarintIdentity(dAtA, i, uint64(m.VerifiedAt))
		i--
		dAtA[i] = 0x40
	}
	if m.CreatedAt != 0 {
		i = encodeVarintIdentity(dAtA, i, uint64(m.CreatedAt))
		i--
		dAtA[i] = 0x38
	}
	if len(m.VerifiedBy) > 0 {
		i -= len(m.VerifiedBy)
		copy(dAtA[i:], m.VerifiedBy)
		i = encodeVarintIdentity(dAtA, i, uint64(len(m.VerifiedBy)))
		i--
		dAtA[i] = 0x32
	}
	if m.IsVerified {
		i--
		if m.IsVerified {
			dAtA[i] = 1
		} else {
			dAtA[i] = 0
		}
		i--
		dAtA[i] = 0x28
	}
	if len(m.NationalIdHash) > 0 {
		i -= len(m.NationalIdHash)
		copy(dAtA[i:], m.NationalIdHash)
		i = encodeVarintIdentity(dAtA, i, uint64(len(m.NationalIdHash)))
		i--
		dAtA[i] = 0x22
	}
	if len(m.DateOfBirth) > 0 {
		i -= len(m.DateOfBirth)
		copy(dAtA[i:], m.DateOfBirth)
		i = encodeVarintIdentity(dAtA, i, uint64(len(m.DateOfBirth)))
		i--
		dAtA[i] = 0x1a
	}
	if len(m.FullName) > 0 {
		i -= len(m.FullName)
		copy(dAtA[i:], m.FullName)
		i = encodeVarintIdentity(dAtA, i, uint64(len(m.FullName)))
		i--
		dAtA[i] = 0x12
	}
	if m.Id != 0 {
		i = encodeVarintIdentity(dAtA, i, uint64(m.Id))
		i--
		dAtA[i] = 0x8
	}
	return len(dAtA) - i, nil
}

func encodeVarintIdentity(dAtA []byte, offset int, v uint64) int {
	offset -= sovIdentity(v)
	base := offset
	for v >= 1<<7 {
		dAtA[offset] = uint8(v&0x7f | 0x80)
		v >>= 7
		offset++
	}
	dAtA[offset] = uint8(v)
	return base
}
func (m *Identity) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	if m.Id != 0 {
		n += 1 + sovIdentity(uint64(m.Id))
	}
	l = len(m.FullName)
	if l > 0 {
		n += 1 + l + sovIdentity(uint64(l))
	}
	l = len(m.DateOfBirth)
	if l > 0 {
		n += 1 + l + sovIdentity(uint64(l))
	}
	l = len(m.NationalIdHash)
	if l > 0 {
		n += 1 + l + sovIdentity(uint64(l))
	}
	if m.IsVerified {
		n += 2
	}
	l = len(m.VerifiedBy)
	if l > 0 {
		n += 1 + l + sovIdentity(uint64(l))
	}
	if m.CreatedAt != 0 {
		n += 1 + sovIdentity(uint64(m.CreatedAt))
	}
	if m.VerifiedAt != 0 {
		n += 1 + sovIdentity(uint64(m.VerifiedAt))
	}
	l = len(m.Creator)
	if l > 0 {
		n += 1 + l + sovIdentity(uint64(l))
	}
	return n
}

func sovIdentity(x uint64) (n int) {
	return (math_bits.Len64(x|1) + 6) / 7
}
func sozIdentity(x uint64) (n int) {
	return sovIdentity(uint64((x << 1) ^ uint64((int64(x) >> 63))))
}
func (m *Identity) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowIdentity
			}
			if iNdEx >= l {
				return io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= uint64(b&0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		fieldNum := int32(wire >> 3)
		wireType := int(wire & 0x7)
		if wireType == 4 {
			return fmt.Errorf("proto: Identity: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: Identity: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field Id", wireType)
			}
			m.Id = 0
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowIdentity
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				m.Id |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field FullName", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowIdentity
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthIdentity
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthIdentity
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.FullName = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 3:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field DateOfBirth", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowIdentity
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthIdentity
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthIdentity
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.DateOfBirth = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 4:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field NationalIdHash", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowIdentity
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthIdentity
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthIdentity
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.NationalIdHash = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 5:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field IsVerified", wireType)
			}
			var v int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowIdentity
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				v |= int(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			m.IsVerified = bool(v != 0)
		case 6:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field VerifiedBy", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowIdentity
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthIdentity
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthIdentity
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.VerifiedBy = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 7:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field CreatedAt", wireType)
			}
			m.CreatedAt = 0
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowIdentity
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				m.CreatedAt |= int32(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
		case 8:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field VerifiedAt", wireType)
			}
			m.VerifiedAt = 0
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowIdentity
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				m.VerifiedAt |= int32(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
		case 9:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Creator", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowIdentity
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthIdentity
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthIdentity
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Creator = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		default:
			iNdEx = preIndex
			skippy, err := skipIdentity(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if (skippy < 0) || (iNdEx+skippy) < 0 {
				return ErrInvalidLengthIdentity
			}
			if (iNdEx + skippy) > l {
				return io.ErrUnexpectedEOF
			}
			iNdEx += skippy
		}
	}

	if iNdEx > l {
		return io.ErrUnexpectedEOF
	}
	return nil
}
func skipIdentity(dAtA []byte) (n int, err error) {
	l := len(dAtA)
	iNdEx := 0
	depth := 0
	for iNdEx < l {
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return 0, ErrIntOverflowIdentity
			}
			if iNdEx >= l {
				return 0, io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= (uint64(b) & 0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		wireType := int(wire & 0x7)
		switch wireType {
		case 0:
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return 0, ErrIntOverflowIdentity
				}
				if iNdEx >= l {
					return 0, io.ErrUnexpectedEOF
				}
				iNdEx++
				if dAtA[iNdEx-1] < 0x80 {
					break
				}
			}
		case 1:
			iNdEx += 8
		case 2:
			var length int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return 0, ErrIntOverflowIdentity
				}
				if iNdEx >= l {
					return 0, io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				length |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if length < 0 {
				return 0, ErrInvalidLengthIdentity
			}
			iNdEx += length
		case 3:
			depth++
		case 4:
			if depth == 0 {
				return 0, ErrUnexpectedEndOfGroupIdentity
			}
			depth--
		case 5:
			iNdEx += 4
		default:
			return 0, fmt.Errorf("proto: illegal wireType %d", wireType)
		}
		if iNdEx < 0 {
			return 0, ErrInvalidLengthIdentity
		}
		if depth == 0 {
			return iNdEx, nil
		}
	}
	return 0, io.ErrUnexpectedEOF
}

var (
	ErrInvalidLengthIdentity        = fmt.Errorf("proto: negative length found during unmarshaling")
	ErrIntOverflowIdentity          = fmt.Errorf("proto: integer overflow")
	ErrUnexpectedEndOfGroupIdentity = fmt.Errorf("proto: unexpected end of group")
)
