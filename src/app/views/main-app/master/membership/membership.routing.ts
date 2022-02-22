import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MembershipBrowseComponent } from './browse/membership-browse.component';
import { MembershipInputComponent } from './input/membership-input.component';

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
        component: MembershipBrowseComponent,
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
            component: MembershipInputComponent,
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
export class MembershipRoutingModule { }

