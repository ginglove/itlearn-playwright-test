import Papa from 'papaparse';
import {readFileSync} from 'fs';

export function readCsv<T>(filePath: string): T[] {
    const csvText = readFileSync(filePath, 'utf-8');

    const result = Papa.parse<T>(csvText, {
        header: true,
        skipEmptyLines: true
    });

    if (result.errors.length > 0) {
        throw new Error(result.errors[0].message);
    }

    return result.data;
}

export function getDataById<T extends {id: string}>(
    data: T[],
    id: string
): T {
    const result = data.find(item => item.id === id);

    if (!result) {
        throw new Error(`Data not fount for ${id}`);
    }

    return result;
}