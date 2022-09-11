import { LightningElement,api,track, wire } from 'lwc';
import getRelatedContactsByFilter from '@salesforce/apex/ContactController.getRelatedContactsByFilter';
// Import message service features required for subscribing and the message channel
import {subscribe,unsubscribe,MessageContext} from 'lightning/messageService';
import filterContactsMC from '@salesforce/messageChannel/FilterContactsMessageChannel__c';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Phone', fieldName: 'Phone', type: 'phone' },
    { label: 'Email', fieldName: 'Email', type: 'email' }
];

export default class LmsRelatedContacts extends LightningElement {

    subscription = null;

    @wire(MessageContext)
    messageContext;

    @api recordId;//Inherits Account Record Id from Account Record Page

    @track columns = COLUMNS;
    @track data;


    //Lifecycle hook which fires when a component is inserted into the DOM
    connectedCallback(){
        //subscribing to the Lightning Message Service Channel
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                filterContactsMC,
               // (message) => this.handleFilterKeySubmit(message)
                this.handleFilterKeySubmit
            );
        }
        this.loadRelatedContacts("");
    }
    
    //Lifecycle hook which fires when a component is removed from the DOM
    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    loadRelatedContacts(filterKey){
        getRelatedContactsByFilter({accountId : this.recordId, key : filterKey})
        .then(results=>{
            this.data=results;
        })
        .catch(error=>{
           console.log(error);
        });
    }

    handleFilterKeySubmit(message){
        const filterKey = message.filterKey;
        this.loadRelatedContacts(filterKey);
    }
    //        const payload = { filterKey : this.submittedFilterValue };

}