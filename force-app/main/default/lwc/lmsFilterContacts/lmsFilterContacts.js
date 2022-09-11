import { LightningElement, track, api, wire } from 'lwc';
// Import message service features required for publishing and the message channel
import { publish, MessageContext } from 'lightning/messageService';
import filterContactsMC from '@salesforce/messageChannel/FilterContactsMessageChannel__c';
export default class LmsFilterContacts extends LightningElement {
    
    /**
     * A Context object which provides information about the Lightning web components
     *  that are using the Lightning message service.
     */
    @wire(MessageContext)
    messageContext;
    
     filterValue;
     submittedFilterValue;
    /**
     * Input from Design parameters in Lightning App Builder.
     * Name should match the property name given in meta.xml file
     */
    @api componentLabel;
    //@api filterLabel;//Input from parent component

    handleChange(event){
        this.filterValue=event.target.value;
    }
    handleClick(){
        /**
         * Don’t use the window or document global properties to query for DOM elements
         * Don’t use ID selectors with querySelector. The IDs that you define in HTML templates
         *  may be transformed into globally unique values when the template is rendered.
         */
        this.submittedFilterValue=this.filterKeyValue;
        
    
        const payload = { filterKey : this.submittedFilterValue };

        publish(this.messageContext, filterContactsMC, payload);

    }
}