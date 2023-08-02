# Custom Web Events Tracking
Since all the well-known web tracking tools offer a comprehensive range of features, AutoROICalc comes with a custom web events tracking feature that can be useful in tracking particular or critical events that are important for improving ROI or valuable enough to be tracked with custom setup and report.
It comes in a form of a lightweight JavaScript module that can be integrated easily into any web page.
## What can this module do for you?
- determine the source or/and medium of the session (stores up to 6 different sources)
- provide you the list of collected session sources so far
- put the collected sources into a cookie for further server-sided processing
- seamlessly send the custom event to AutoROICalc
## How to use
- Login into your user account, or create one if you have not registered before. Navigate to Account -> Integrations.
- Find the "AutoROICalc Custom Website Event Tracking" section.
- Click on the "Generate Tracking ID" button (see the image below) if you have not generated it before.
- Set up your custom web event tracking.
### Get the auto-roi-calc.js file, include it in the HTML <head> section, configure, and utilize
In the snippet below, we load the auto-roi-calc.js script first. Next, we set the user's tracking id (replaced by `<YOUR_TRACKING_ID>`), append a new source determined by the module and send it to AutoROICalc.
```html
<!DOCTYPE html>
<html>
<head>
  <title>Sample Page</title>
  <script src="auto-roi-calc.js"></script>
  <script>
    AutoRoiCalc.setTrackingId(<YOUR_TRACKING_ID>);
    AutoRoiCalc.appendNewSource();
    AutoRoiCalc.sendEvent("Sample event source", "Sample event description");
  </script>
</head>
<body>
  <p>The document body.</p>
</body>
</html>
```
### Configuration
There's a default configuration that is possible to be updated:
```javascript
{
  // Whether to log debugging messages.
  debug: false,
  // Max number of sources to store in local storage.
  maxSources: 6,
  // Name of the cookie for storing collected sources. The cookie is created once triggered, not used by default.
  cookieNameSources: "arc_sources",
  // Local storage entry name for the timeout which prevents appending a new source.
  storageNameTimeout: "arc_timeout",
  // Local storage entry name for the timeout which prevents sending the event to AutoROICalc.
  storageNameTimeoutSent: "arc_timeout_sent",
  // Local storage entry name for storing the collected sources.
  storageNameSources: "arc_sources",
  // The timeout for storageNameTimeout and storageNameTimeoutSent in minutes.
  timeout: 60,
  // Whether to ignore the utm_campaign URL parameter when determining the session source.
  ignoreUtmCampaign: false,
  // Whether to ignore the utm_source URL parameter when determining the session source.
  ignoreUtmSource: false,
  // Whether to use the Google Analytics style source/medium as the record source for AutoROICalc.
  useSourceMedium: true
}
```
To update one of the config values, use the `setConfig` method:
```javascript
AutoRoiCalc.setConfig(key, value);
```
For example:
```javascript
AutoRoiCalc.setConfig("debug", true);
AutoRoiCalc.setConfig("maxSources", 3);
AutoRoiCalc.setConfig("cookieNameSources", "customCookieName");
// etc.
```
To get the current configuration, use:
```javascript
AutoRoiCalc.getConfig();
```
### Appending a new session source
To append a new session source, use:
```javascript
AutoRoiCalc.appendNewSource();
```
In this case, it determines the session source this way:
- checks the timeout first - if it's not expired, it aborts
- it looks for `arc_source` URL parameter - if set, uses the parameter value as the source
- next, it tried to get the value of `utm_campaign` URL parameter
- in the next step, if the `useSourceMedium` config is set, internally determines the source/medium of the session, else it gets only the internally determined session source
Additionally, it is possible to append a custom source with an option to ignore the timeout, for example:
```javascript
// to append the custom source, with the timeout check
AutoRoiCalc.appendNewSource("custom source");
// to append the custom source, ignoring the timeout check
AutoRoiCalc.appendNewSource("custom source", true);
// to append the source in the default manner, check timeout, whilst using a custom local storage item name for the timeout timestamp
AutoRoiCalc.appendNewSource("custom source", true, "custom_storage_item_name");
```
### Getting currently collected sources so far
This gets a list of currently appended sources so far:
```javascript
AutoRoiCalc.getSources();
// get the sources whilst ignoring the duplicates check
AutoRoiCalc.getSources(false);
```
### Send an event to AutoROICalc
Using this method, it is possible to send the custom event to AutoROICalc from the client side:
```javascript
AutoRoiCalc.sendEvent("Record type", "Record description");
```
The first two parameters are required: the record type and description. There are additional parameters to set the record value (default is 1), whether to check the timeout from the last event sent, whether to use a custom local storage item name for storing the event timestamp for the timeout check, or whether to send the event with a custom source at this stage:
```javascript
AutoRoiCalc.sendEvent("Record type", "Record description", 1, true, "custom_storage_item_name", "Custom Source");
```
### Put the collected sources into a cookie
For further server-sided processing, it is possible to put the sources into a cookie:
```javascript
AutoRoiCalc.setCookie();
```
Each time this method is triggered, the cookie value is updated according to currently collected session sources.
## Need help?
Contact the support at support@autoroicalc.com
