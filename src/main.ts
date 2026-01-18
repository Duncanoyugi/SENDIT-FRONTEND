import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import '@fortawesome/fontawesome-free/css/all.min.css';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
