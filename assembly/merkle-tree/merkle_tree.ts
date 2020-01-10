import { mimc_compress2 } from "./mimc.ts";

import { bn128_frm_zero, bn128_fr_mul, bn128_frm_fromMontgomery, bn128_frm_toMontgomery, bn128_frm_mul, bn128_frm_add, bn128_g1m_toMontgomery, bn128_g2m_toMontgomery, bn128_g1m_neg, bn128_ftm_one, bn128_pairingEq4, bn128_g1m_timesScalar, bn128_g1m_add, bn128_g1m_affine, bn128_g1m_neg} from "./websnark_bn128";

import { SIZE_F, memcmp } from "./util.ts";

@external("env", "debug_printMemHex")
export declare function debug_mem(pos: i32, len: i32): void;

// bn128 point size
export const ROOT_OFFSET = 0;

export function verify_merkle_proof(p_proof: usize): u32 {
    let p_computed_root = (new Uint8Array(SIZE_F)).buffer as usize;
    let p_proof_root = p_proof + ROOT_OFFSET;

    compute_root(p_proof, p_computed_root);

    return memcmp(p_computed_root, p_proof_root);
}

// convert all the field elements in the proof to montgomery form
export function merkle_proof_init(p_proof: usize): void {
    let root = ( p_proof as usize ); 
    // debug_mem(root, SIZE_F);
    bn128_frm_toMontgomery(root, root);

    // debug_mem(0, SIZE_F * 2);

    let num_witnesses = load<u64>(p_proof + 40) as u64;

    let p_selectors: usize = root + 48;
    let selector = load<u8>(p_selectors);

    let witnesses: usize = p_selectors + num_witnesses as usize;
    // debug_mem(witnesses, SIZE_F);

    for (let i: usize = 0; i < num_witnesses; i++) {
        //debug_mem(witnesses + i * SIZE_F, SIZE_F);
        bn128_frm_toMontgomery(witnesses + i * SIZE_F, witnesses + i * SIZE_F);
    }

    // debug_mem(0, SIZE_F * 2);

    let leaf: usize = witnesses + ( num_witnesses as usize * SIZE_F );
    // debug_mem(leaf, SIZE_F);
    bn128_frm_toMontgomery(leaf, leaf);
}

export function get_proof_size(p_proof: usize): usize {
    // TODO
}

// computes the merkle root and modifies the proof root
export function compute_proof(p_proof: usize): void {
    let p_proof_root = p_proof + ROOT_OFFSET;
    compute_root(p_proof, p_proof_root);
}

export function compute_root(p_proof: usize, p_out_root: usize): void {
    let root = ( p_proof as usize ); 

    bn128_frm_fromMontgomery(root, root);
    //debug_mem(root, SIZE_F);
    bn128_frm_toMontgomery(root, root);

    // TODO: index/num_witnesses are serialized as u64 and casted to usize which could cause overflow.
    let num_witnesses = load<u64>(p_proof + 40) as u64;

    let p_selectors: usize = root + 48;
    let selector = load<u8>(p_selectors);

    let witnesses: usize = p_selectors + num_witnesses as usize;

    let leaf: usize = witnesses + ( num_witnesses as usize * SIZE_F );

    if (selector == 0) {
        mimc_compress2(leaf, witnesses, p_out_root);
    } else {
        mimc_compress2(witnesses, leaf, p_out_root);
    }

    bn128_frm_fromMontgomery(p_out_root, p_out_root);
    //debug_mem(p_out_root, SIZE_F);
    bn128_frm_toMontgomery(p_out_root, p_out_root);

    p_selectors++;
    selector = load<u8>(p_selectors);

    for (let i: usize = 1; i < num_witnesses; i++) {
        if (selector == 0) {
            mimc_compress2(p_out_root, witnesses + i * SIZE_F, p_out_root);
        } else {
            mimc_compress2(witnesses + i * SIZE_F, p_out_root, p_out_root);
        }

        bn128_frm_fromMontgomery(p_out_root, p_out_root);
        //debug_mem(p_out_root, SIZE_F);
        bn128_frm_toMontgomery(p_out_root, p_out_root);

        // debug_mem(p_out_root, SIZE_F);

        p_selectors++;
        selector = load<u8>(p_selectors);
    }

    //bn128_frm_fromMontgomery(p_out_root, p_out_root);
}
