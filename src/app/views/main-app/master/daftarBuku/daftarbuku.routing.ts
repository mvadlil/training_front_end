import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DaftarBukuBrowseComponent } from './browse/daftarbuku-browse.component';
import { DaftarbukuInputComponent } from './input/daftarbuku-input.component';

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
        component: DaftarBukuBrowseComponent,
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
            component: DaftarbukuInputComponent,
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
export class CustomerRoutingModule { }

