export function chunkIntoColumns<T>(arr: T[], numCols: number): T[][] {
    // Create numCols empty arrays
    const columns: T[][] = Array.from({ length: numCols }, () => []);
    const size = Math.ceil(arr.length / numCols);

    return Array.from({ length: numCols }, (v, i) =>
        arr.slice(i * size, i * size + size)
    );

}