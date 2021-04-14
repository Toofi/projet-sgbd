# Projet SGBD

Suivre le projet avec [Trello](https://trello.com/invite/b/pqxv6eIj/3843ead3be6efb135dd93262ab91d076/projet-sgbd)

Nous allons traquer les prix des objets amazon (ou autres) et stocker leur évolution. On entre l'url, il va créer une fiche produit, et traquer les prix. Si on met un threshold, celui-ci va nous alerter par e-mail quand le prix est atteint. Sinon, il envoie une alerte à chaque baisse de prix.

Gestion de compte avec mot de passe afin d'accéder à ses trackings.

Côté back, utiliser express, puppeteer (pour récupérer les infos des pages amazon/autres), et nodemailer pour l'envoi d'e-mails.

Le document users va permettre une authentification et un stockage des produits que l'utilisateur veut surveiller, avec un sous-document contenant la liste des dits produits à surveiller ainsi que le seuil de prix pour lequel envoyer un e-mail/notification. Il y aura un document avec tous les produits et urls et un document des prix à côté. Voir pour faire en sorte que le document détruise les plus anciens éléments automatiquement pour économiser le volume de données. Enfin, un document alerts qui contiendra les infos envoyées par e-mail quand l'application enclenche un envoi, et permettra un suivi des envois d'e-mails.

## Structure des documents (provisoire)

```javascript
Products
{
	"_id",
	"name": string,
	"url": string
}
Users
{
	"_id",
	"nickName": string,
	"firstName": string,
	"lastName": string,
	"emails": [string],
	"password": string,
	"trackedProducts":
		[{
			"productId": id,
			"priceThreshold": decimal	
		}]
}
Prices
{
	"_id",
	"productId": id,
	"price": decimal,
	"date": datetime,
	"isPromo": boolean
}
Alerts
{
	"_id",
	"price": decimal,
	"productId": id
}
```
