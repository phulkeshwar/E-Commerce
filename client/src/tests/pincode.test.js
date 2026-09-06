import test from "node:test";
import assert from "node:assert/strict";
import { validatePincode, lookupPincode } from "../utils/pincodeService.js";

test("Pincode Validation - Valid & Invalid Format", () => {
  // Valid Indian 6-digit PIN codes
  assert.equal(validatePincode("110001"), true); // Delhi
  assert.equal(validatePincode("400001"), true); // Mumbai
  assert.equal(validatePincode("560001"), true); // Bengaluru
  assert.equal(validatePincode("700001"), true); // Kolkata
  assert.equal(validatePincode("800001"), true); // Patna
  assert.equal(validatePincode(600001), true); // Numeric input

  // Invalid PIN codes
  assert.equal(validatePincode("010001"), false); // Starts with 0
  assert.equal(validatePincode("11000"), false); // 5 digits
  assert.equal(validatePincode("1100001"), false); // 7 digits
  assert.equal(validatePincode("11000A"), false); // Alphanumeric
  assert.equal(validatePincode(""), false); // Empty
  assert.equal(validatePincode(null), false); // Null
  assert.equal(validatePincode(undefined), false); // Undefined
});

test("Pincode Lookup - Metro and State Mapping", () => {
  const delhi = lookupPincode("110001");
  assert.equal(delhi.valid, true);
  assert.equal(delhi.state, "Delhi");
  assert.equal(delhi.isMetro, true);
  assert.equal(delhi.serviceable, true);
  assert.equal(delhi.fastestDelivery, "Express Next-Day");

  const bengaluru = lookupPincode("560001");
  assert.equal(bengaluru.valid, true);
  assert.equal(bengaluru.state, "Karnataka");
  assert.equal(bengaluru.isMetro, true);

  const mumbai = lookupPincode("400001");
  assert.equal(mumbai.valid, true);
  assert.equal(mumbai.state, "Maharashtra");
  assert.equal(mumbai.isMetro, true);

  const jaipur = lookupPincode("302001");
  assert.equal(jaipur.valid, true);
  assert.equal(jaipur.state, "Rajasthan");
  assert.equal(jaipur.isMetro, false);
});

test("Pincode Lookup - Dynamic Delivery Dates", () => {
  const info = lookupPincode("110001");
  assert.equal(info.valid, true);
  assert.ok(info.deliveryRange.length > 0);
  assert.ok(info.estimatedDeliveryText.startsWith("Delivery by"));
  assert.equal(info.deliveryDaysMin, 1);
  assert.equal(info.deliveryDaysMax, 2);
});

test("Pincode Lookup - Invalid Handling", () => {
  const invalid = lookupPincode("999");
  assert.equal(invalid.valid, false);
  assert.equal(invalid.serviceable, false);
  assert.ok(invalid.message.includes("valid 6-digit"));
});
