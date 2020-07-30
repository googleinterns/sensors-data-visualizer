import { Directive, ViewContainerRef } from '@angular/core'

@Directive({ selector: '[uploadDirective]' })
export class UploadDirective {
    constructor (public viewContainerRef: ViewContainerRef) {}
}