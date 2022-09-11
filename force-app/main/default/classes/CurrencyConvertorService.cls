public with sharing class CurrencyConvertorService {

//Fetching conversion prices
  @AuraEnabled(cacheable=true)
  public static double currencyConversion(string sourceCurrency, string targetCurrency, string amount) {
    system.debug('targetCurrency '+targetCurrency);
    if(targetCurrency == null){
      system.debug('Not a string;null value');
    }
    if(targetCurrency == 'null'){
      system.debug('String value');
    }

      HTTP http = new HTTP();
      HTTPRequest request= new HTTPRequest();
      request.setEndpoint('https://api.apilayer.com/exchangerates_data/convert?to='+targetCurrency+'&from='+sourceCurrency+'&amount='+amount);
      request.setHeader('apikey', 'tPmN2kN97GiEYl2l5X9SIAFd84hYHWa6');
      request.setMethod('GET');
      HTTPResponse response = http.send(request);
      Map<string,object> Jsonbody = (Map<string,object>)Json.deserializeUntyped(response.getBody());
      system.debug(Jsonbody);
      return (double)Jsonbody.get('result');

  }

  //To display the history of the convesrion
  @AuraEnabled
  public static Currency_Conversion_History__c[] getConversionHistory() {
      return [
        SELECT Id,Input_Amount__c,Conversion_Type__c	 FROM Currency_Conversion_History__c
          ORDER BY CreatedDate DESC
      ];
  }
}