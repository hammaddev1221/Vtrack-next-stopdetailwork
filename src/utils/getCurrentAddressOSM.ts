export function getCurrentAddressOSM(currentLocation: any) {
    try {
      var address1;
      var address2;
      var city;
      var postcode;

      if (!currentLocation?.address) {
        return "";
      }

      if (
        currentLocation === null ||
        currentLocation === undefined ||
        currentLocation?.address === null ||
        currentLocation?.address === undefined
      ) {
        address1 = "";
      } else if (currentLocation?.address?.office) {
        address1 = currentLocation?.address?.office;
      } else if (currentLocation?.address?.neighbourhood) {
        address1 = currentLocation?.address?.neighbourhood;
      } else {
        address1 = "";
      }
      if (currentLocation?.address?.road) {
        address2 = currentLocation?.address?.road;
      } else if (currentLocation?.address?.suburb) {
        address2 = currentLocation?.address?.suburb;
      } else {
        address2 = "";
      }

      if (currentLocation === null || currentLocation?.address === null) {
        address2 = "";
      } else if (currentLocation?.address?.city) {
        city = currentLocation?.address?.city;
      } else {
        city = "";
      }
      if (currentLocation === null || currentLocation?.address === null) {
        postcode = "";
      } else if (currentLocation?.address?.postcode) {
        postcode = currentLocation?.address?.postcode;
      } else {
        postcode = "";
      }
      var currentLocationPoint =
        address1 + " " + address2 + " " + city + " " + postcode;
      return currentLocationPoint;
    } catch (err) {
      console.error(err);
    }
  }