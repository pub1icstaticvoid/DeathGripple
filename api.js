export async function fetchDiscography() {
    const response = await fetch('dg_data.json');
    if (!response.ok) {
        throw new Error('Could not load discography data');
    }
    return await response.json();
}