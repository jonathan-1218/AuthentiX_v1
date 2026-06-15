import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

export function buildMerkleRoot(records: Record<string, unknown>[]): string {
  const leaves = records.map((r) => keccak256(JSON.stringify(r)));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return tree.getRoot().toString("hex");
}

export function buildMerkleTree(records: Record<string, unknown>[]) {
  const leaves = records.map((r) => keccak256(JSON.stringify(r)));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return { tree, root: tree.getRoot().toString("hex") };
}
