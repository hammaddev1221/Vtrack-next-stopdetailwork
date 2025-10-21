export type StopAddressData = {
    address: {
        city: string;
        country: string;
        country_code: string;
        county: string;
        hamlet: string;
        neighbourhood: string;
        postcode: string;
        road: string;
        state: string;
        town: string;
    };
    
    addresstype: string;
    boundingbox: [string, string, string, string];
    category: string;
    display_name: string;
    importance: number;
    lat: string;
    licence: string;
    lon: string;
    name: string;
    osm_id: number;
    osm_type: string;
    place_id: number;
    place_rank: number;
    type: string;
  };
  