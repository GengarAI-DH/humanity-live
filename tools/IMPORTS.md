# Importing official datasets

The update machine can't reach most science sites, but the website's server can. To download a file:

1. Write a job into the `humanity-live-imports` key-value store (Cloudflare account 109b2ec49eb5dd854d8b91933cb67132, namespace id 99372d5ba3dd444abe48d05cbdc25666) with key `job:<any-id>` and value `{"url":"https://..."}` (optional: `"method":"POST"`, `"body"`, `"contentType"`, `"accept"`).
   With the Cloudflare tool: `cloudflare.request({method:"PUT", path:`/accounts/${accountId}/storage/kv/namespaces/99372d5ba3dd444abe48d05cbdc25666/values/job:volcanoes1`, body: JSON.stringify({url:"..."}), headers:{"Content-Type":"text/plain"}})`
2. Within about a minute the server downloads it and stores the bytes at `res:<same-id>` (kept 3 days). Read the metadata (status, type, size, error) with
   `GET .../metadata/res:<id>` and the content with `GET .../values/res:<id>` (returns the raw text; use the tool's `truncate:false` and save it to a file).
3. Only these hosts are allowed (see IMPORT_HOSTS in src/worker.js): Smithsonian GVP, NOAA NCEI/NGDC/NHC/SPC/PSL, USGS earthquakes, Paleobiology Database, UNESCO, Wikidata, GBIF, Zenodo, Natural Earth, NASA GISS/EONET/JPL, Earth Impact Database, IUCN API, Wikipedia. Files over 24 MB are refused: filter the request (for example the Paleobiology Database API by taxon and time interval).

Good sources:
- Volcanoes and eruptions: https://volcano.si.edu (Volcanoes of the World)
- Significant earthquakes, tsunamis, eruptions: NOAA NCEI Hazard API, https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/earthquakes?minYear=-2150&maxYear=2026&page=1
- Recent earthquakes: https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=7&starttime=1900-01-01
- Fossils: https://paleobiodb.org/data1.2/occs/list.json?base_name=Dinosauria&interval=Maastrichtian&show=coords,paleoloc,class
- Wikidata (battles, cities founded, people, structures with dates and coordinates): https://query.wikidata.org/sparql?format=json&query=...
Always credit the source in the commit message and, for large imports, in the app's card text.
