/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/
import Mail from "@ioc:Adonis/Addons/Mail"
import Event from "@ioc:Adonis/Core/Event"

Event.on('mail:sent', Mail.prettyPrint)