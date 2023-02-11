# AKSO notif templating
Notif templating in AKSO takes a template string such as the below:

```
Hello, {{name}}
```

All template keys are written as `{{identifier}}`. When used for HTML, this will return the escaped value. For plaintext it returns the unescaped value.

Identifiers are variables as defined in AKSO Script. Intents can define certain context values which can be accessed using an `@` prefix. E.g. for the `codeholder` intent, a template like this would be valid. Non-prefixed variables are expected to be derived from AKSO Script.

```
Hello, {{@codeholder.name}}
```

Additionally it's possible to create conditional blocks using booleans (that are type casted by JavaScript if needed), e.g:

```
{{#if @codeholder.oldCode}}
	{{@codeholder.oldCode}}
{{#else}}
	You do not have an old UEA code.
{{/if}}
```

# Intents
The following intents are implemented at this time:

## `codeholder`
This is used to send simple multi-purpose notifications to codeholders. The following context fields are available:

```js
{
	codeholder: {
		id // The codeholder's internal id
		name // The full name of the codeholder
		oldCode // The old UEA code
		newCode // The new UEA code
		codeholderType // human or org
		hasPassword // Whether the codeholder has created an account
		addressFormatted // The codeholder's formatted address
		addressLatin: { // The codeholder's distinct address bits
			country
			countryArea
			city
			cityArea
			streetAddress
			postalCode
			sortingCode
		}
		feeCountry // The codeholder's fee country
		email
		birthdate // The codeholder's birthdate as yyyy-mm-dd
		cellphone
		officePhone
		landlinePhone
		age
		agePrimo // The codeholder's age in whole years at the beginning of the year
	}
}
```

## `newsletter`
This is used to send out newsletters to their subscribers. It inherits all fields from `codeholder`.

## `newsletter_magazine`
This is used to send out magazine announcement newsletters to their subscribers. It inherits all fields from `newsletter` and adds the following fields:

```js
{
	magazine: {
		id
		org
		name
		description
		issn
		magazineURL // the URL of the magazine on the organization's website
	},
	edition: {
		id
		idHuman
		date
		thumbnailURL // null if no thumbnail
		description
		editionURL // the URL of the edition on the organization's website
	},
	toc: { // a generated, formatted table of contents of the magazine edition
		md   // formatted as markdown
		html // formatted as html
		text // formatted as plaintext
	}
}
```

## `congress_registration`
This is used to send out registration confirmation notifs to new registrants. It contains the following fields:

```js
{
	registrationEntry: {
		price
		currency
		sequenceId
		createdTime
		canEdit
		dataId
		dataKeys
		dataMeta // an array of arrays containing the following fields: type, label, variant/currency/tz (or null)
		dataVals // when combined with dataKeys this is essentially a map
	}
}
```

## `vote_cast_ballot`
This is used to send out notifications that an eligible voter can cast their vote in a ballot, either as the first notif or as a reminder to those who have not yet voted. It inherits all fields from `codeholder` and adds the following fields:

```js
{
	vote: { // all fields from GET /votes
		id
		org
		name
		description
		timeStart
		timeEnd
		hasStarted
		ballotsSecret
		type
		publishVoters
		publishResults
	}
}
```
