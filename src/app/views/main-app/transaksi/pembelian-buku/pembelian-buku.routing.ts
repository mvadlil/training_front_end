import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PembelianBukuBrowseComponent } from './browse/pembelian-buku-browse.component';
import { PembelianBukuInputComponent } from './input/pembelian-buku-input.component';

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
        component: PembelianBukuBrowseComponent,
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
            component: PembelianBukuInputComponent,
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
export class InvoiceManualRoutingModule { }

