// bn128 point size
export const SIZE_F = 32;

// memcpy fixed SIZE_F (32 bytes) amount
export function memcpy(dest: usize, src: usize): void {
    for (let i = 0; i < SIZE_F / 8; i++) {
        store<u64>( dest+(i*8), load<u64>(src+(i*8)) );
    }
}

/*
export function memcpy(dest: usize, src: usize): void {
    memory.copy(dest, src, 32);
}
*/

// compare SIZE_F bytes between a and b.  return 0 if they are the same, 1 if not
export function memcmp(a: usize, b: usize): u8 {
    for (let i = 0; i < SIZE_F / 8; i++) {
        if (load<u64>(a + i * 8) != load<u64>( b + i * 8)) {
            return 1;
        }
    }
    return 0;
}
