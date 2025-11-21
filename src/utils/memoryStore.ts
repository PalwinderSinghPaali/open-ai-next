export let memoryStore: {
  embedding: number[];
  text: string;
}[] = [];

export function getMemoryVectorStore() {
  return memoryStore;
}

export function setMemoryVectorStore(newData: any) {
  memoryStore = newData;
}