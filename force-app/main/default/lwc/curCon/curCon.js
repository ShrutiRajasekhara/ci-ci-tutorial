import { LightningElement, track } from 'lwc';
import currencyConversion from '@salesforce/apex/CurrencyConvertorService.currencyConversion';
import Currency_Conversion_History__c_OBJECT from '@salesforce/schema/Currency_Conversion_History__c';
import getConversionHistory from '@salesforce/apex/CurrencyConvertorService.getConversionHistory';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import inputAmount from '@salesforce/schema/Currency_Conversion_History__c.Input_Amount__c';
import targetCurrency from '@salesforce/schema/Currency_Conversion_History__c.Conversion_Type__c';
import convertedAmount from '@salesforce/schema/Currency_Conversion_History__c.Converted_Amount__c';
import { createRecord } from 'lightning/uiRecordApi';

export default class CurCon extends LightningElement {
    
    clickedButtonLabel = 'Show History';
    showHistory = false;
    data;
    historyColumns = [
        { label: 'Input Amount(CAD)', fieldName: 'Input_Amount__c', type: 'currency', cellAttributes: { alignment: 'left' } },
        { label: 'Forex Type', fieldName: 'Conversion_Type__c', type: 'text' },
        { label: 'Forex Amount', fieldName: 'Converted_Amount_with_Currency_code__c', type: 'text', cellAttributes: { alignment: 'left' } }

    ];
    sourceCurrency = 'CAD';
    targetCurrency;
    amount = '';

    // Retrieve or hide currency conversion history upon clicking the button
    handleClick(event) {
        
        const label = event.target.label;
        if (label === 'Show History') {
            this.clickedButtonLabel = 'Hide History';
            this.showHistory = true;

            getConversionHistory()
                .then(data => {
                    this.data = data;
                    console.log('Inside getConversionHistory');
                    console.log('history ' + JSON.stringify(data));
                }).catch(error => {
                    console.error('Error in getting the history data', error.body.message);
                });
        } else if (label === 'Hide History') {
            this.clickedButtonLabel = 'Show History';
            this.showHistory = false;
        }
    }

    // Currency Conversion upon clicking Convert Button
    handleConvert() {
        
        // Pattern that matches any number of digits followed by optional decimal and atleast one subsequent decimal digit
        const validAmountRe = /^\d*\.{0,1}\d+$/;
        console.log('Before log');
        console.log('Amount--' + this.amount.match(validAmountRe));
        console.log('After log');
        if (!this.amount.match(validAmountRe)) {
            const event = new ShowToastEvent({
                title: 'Invalid Amount',
                message: 'Please enter valid amount',
                variant: 'error'
            });
            this.dispatchEvent(event);
            return;
        }
        // Apex class to call the external conversion API
        console.log( 'After amount.match');
        currencyConversion({ sourceCurrency: this.sourceCurrency, targetCurrency: this.targetCurrency, amount: this.amount })
            .then(result => {
                // Round off to two decimal digits
                this.convertedAmount = result.toFixed(2);
                console.log('result2-- '+result);
                // Save the conversion details in the database
                const fields = {};
                fields[inputAmount.fieldApiName] = this.amount;
                fields[targetCurrency.fieldApiName] = this.targetCurrency;
                fields[convertedAmount.fieldApiName] = this.convertedAmount;
                const recordInput = { apiName: Currency_Conversion_History__c_OBJECT.objectApiName, fields };
                createRecord(recordInput)
                    .then(() => {
                        getConversionHistory()
                            .then(data => {
                                this.data = data;
                            }).catch(error => {
                                console.error('Error in getting the history data after record insertion', error.body.message);
                            });
                    }).catch(error => {
                        console.error('Error in record insertion', error.body.message);
                    });
            }).catch(error => {
                console.error('Error in getting the conversion data', error.body.message);
            });

    }
    handleInputAmount(event) {
        this.amount = event.detail.value;
    }
    handleTargetCurrency(event) {
        this.targetCurrency = event.detail.value;
    }
    get currencyOptions() {
        return [
            { label: 'US Dollar', value: 'USD' },
            { label: 'EURO', value: 'EUR' },
        ];
    }
    
}