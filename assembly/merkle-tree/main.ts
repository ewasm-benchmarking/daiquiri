// import { bn128_frm_zero, bn128_fr_mul, bn128_frm_fromMontgomery, bn128_frm_toMontgomery, bn128_frm_mul, bn128_frm_add, bn128_g1m_toMontgomery, bn128_g2m_toMontgomery, bn128_g1m_neg, bn128_ftm_one, bn128_pairingEq4, bn128_g1m_timesScalar, bn128_g1m_add, bn128_g1m_affine, bn128_g1m_neg} from "./websnark_bn128";

const SIZE_F = 32;
import { mimc_init, NULL_HASH } from "./mimc.ts";

const p_NULL_HASH = NULL_HASH.buffer as usize;

import { verify_merkle_proof, merkle_proof_init } from "./merkle_tree.ts";

import { memcpy } from "./util.ts";

@external("env", "debug_printMemHex")
export declare function debug_mem(pos: i32, len: i32): void;

@external("env", "input_size")
export declare function input_size(): i32;

@external("env", "input_data_copy")
export declare function input_data_copy(outputOffset: i32, srcOffset: i32, length: i32): void;

@external("env", "save_output")
export declare function save_output(offset: i32): void;

function deposit(input_data: usize, prestate_root: usize, out_root: usize): void {
    let mixer_root = input_data;
    let withdraw_root = mixer_root + SIZE_F;
    let deposit_proof = withdraw_root + SIZE_F;

    merkle_proof_init(deposit_proof);

    let tmp1: usize = (new Uint8Array(SIZE_F)).buffer as usize;
    let tmp2: usize = (new Uint8Array(SIZE_F)).buffer as usize;
    
    let p_proof_leaf = deposit_proof + 48 + 20 * SIZE_F;

    // take the proof and replace the leaf (deposit) with null, verify that the computed root was the prestate root

    // memcpy(tmp1, mixer_root);
    // memcpy(tmp2, p_proof_leaf);
    // memcpy(mixer_root, prestate_root);
    // memcpy(p_proof_leaf, p_NULL_HASH);

    //debug_mem(p_NULL_HASH, SIZE_F);
    if (verify_merkle_proof(deposit_proof) != 0) {
        debug_mem(0, SIZE_F);
        return
    }

    // re-insert the leaf and verify the merkle proof

    /*
    memcpy(mixer_root, tmp1);
    memcpy(p_proof_leaf, tmp2);

    if (verify_merkle_proof(deposit_proof) != 0) {
        debug_mem(1, SIZE_F);
        return;
    }
    */

    // return the new prestate
}

// TODO make all numbers in the proof expected to be passed in montgomery form
export function main(): i32 {
    let input_data_len = input_size();
    let input_data_buff = new ArrayBuffer(input_data_len);
    input_data_copy(input_data_buff as usize, 0, input_data_len);

    let result = new Uint8Array(SIZE_F);

    mimc_init();

    deposit(input_data_buff as usize, result.buffer as usize, result.buffer as usize);

    save_output(result.buffer as usize);

    return 0;
}
