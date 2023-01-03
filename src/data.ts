export interface CyclingData {
    Time: string // "MM:SS"
    Place: number,
    Seconds: number,
    Name: string,
    Year: number,
    Nationality: string, // 3 length, all caps
    Doping: string, // description of doping usage
    URL: string // source
}

export function getData(url: string) : Array<CyclingData> {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();

    const obj = JSON.parse(xhr.response);
    // Logs to console if any problem with data
    validateCyclingDataArray(obj);

    return obj;
}

function validateCyclingData(data: CyclingData): boolean {
    return typeof data.Time === "string" && /[0-9][0-9]+:[0-9][0-9]/.test(data.Time) &&
        typeof data.Place === "number" && data.Place > 0 &&
        typeof data.Seconds === "number" && data.Seconds > 0 &&
        typeof data.Name === "string" && data.Name.length > 0 &&
        typeof data.Year === "number" && data.Year > 0 &&
        typeof data.Nationality === "string" && data.Nationality.length > 0 &&
        typeof data.Doping === "string" &&
        typeof data.URL === "string";
}

function validateCyclingDataArray(data: Array<CyclingData>): boolean {
    if (!Array.isArray(data)) {
        console.error("JSON Cycling object was expected to be an array, but got type " + typeof data);
        return false;
    }

    for (let i = 0; i < data.length; ++i) {
        if (!validateCyclingData(data[i])) {
            console.error("Cycling data at index " + i + " is invalid!");
            return false;
        }
    }
    
    return true;
}
