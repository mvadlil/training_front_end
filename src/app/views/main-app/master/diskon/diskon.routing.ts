import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DiskonBrowseComponent } from './browse/diskon-browse.component';
import { DiskonInputComponent } from './input/diskon-input.component';

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: null
    },
    children: [
      { path: '',
        data: {
          breadcrumb: null
        },
        component: DiskonBrowseComponent,
      },
      {
        path: 'input',
        data: {
          breadcrumb: 'Input'
        },
        children: [
          { path: '',
            data: {
              breadcrumb: null
            },
            component: DiskonInputComponent,
          },
        ]
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiskonRoutingModule { }

