import { MerkleTree } from 'merkletreejs';
import { c32addressDecode } from 'c32check'; // Decode principal to version + hash160
import { sha256 } from '@noble/hashes/sha256';
import { hexToBytes, bytesToHex } from '@stacks/common';

export function gatedMerkleProof(tree: MerkleTree, address: string) {
	const root = tree.getRoot().toString('hex');
	const [version, hash160] = c32addressDecode(address);
	const hashBytes = hexToBytes(hash160);
	const leaf = bytesToHex(sha256(hashBytes));
	const proof = tree.getProof(leaf);
	const valid = tree.verify(proof, leaf, root);
	// console.log("Merkle version:" + version);
	// console.log("Merkle hash160:" + hash160);
	// console.log("Merkle address:" + address);
	// console.log("Merkle root:" + root);
	// console.log("Merkle leaf:" + leaf);
	// console.log("Is valid proof:", valid);
	// console.log("Leaves (Tree):", tree.getLeaves().map(bytesToHex));
	return { proof, valid, leaf };
}

export function gatedMerkleTree(txids: Array<string>) {
	const leaves = txids.map((txid) => {
		return sha256(txid);
	});
	const tree = new MerkleTree(leaves, sha256);
	const root = tree.getRoot().toString('hex');
	return { tree, root };
}
