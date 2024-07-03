export async function downloadFile(
  url: string,
  method = "GET",
  body: any = null,
  token: any = null,
  defaultApi: boolean = true,
  type: string = "text/csv"
) {
  const headers: any = {
    "Content-Type": type,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: any = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
    cache: "no-store",
  };

  const endpoint = defaultApi
    ? process.env.NEXT_PUBLIC_BO_API_BASE_URL + url
    : process.env.NEXT_PUBLIC_BO_TRANS_API_BASE_URL + url;
  console.log(endpoint);

  return await fetch(endpoint, options);
}

export async function clientFetchData(
  url: string,
  method = "GET",
  body: any = null,
  token: any = null,
  defaultApi: boolean = true
) {
  const headers: any = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: any = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
    cache: "no-store",
  };

  const endpoint = defaultApi
    ? process.env.NEXT_PUBLIC_BO_API_BASE_URL + url
    : process.env.NEXT_PUBLIC_BO_TRANS_API_BASE_URL + url;

  const response = await fetch(endpoint, options);

  return response.json();
}
