import { Component, Input, ViewChildren,ViewChild, QueryList, ElementRef} from '@angular/core';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Meta, Title } from '@angular/platform-browser';
import {Draggable} from '@shopify/draggable';

@Component({
  selector: 'sidebar',
  templateUrl: 'sidebar.html',
  styleUrls:['document.css']
})
class SidebarComponent {
}

@Component({
  selector: 'document',
  templateUrl: 'document.html',
    styleUrls:['PillSwitch.css']
})
class DocumentComponent {
  //Injected the Meta and title dependency to be able to change the
  //meta data in the head tag and to be able to change the title
  siteName = 'TCP packet creator';
  description = 'TCP packet creator is a lightweight, responsive, modern drag and drop JavaScript library. ';
  toggleClass = 'PillSwitch--isOn';
  @ViewChild("PillSwitch") containers : ElementRef;
  constructor(private title: Title, private meta: Meta) {
    this.title.setTitle(this.siteName);
    this.meta.updateTag({name:'format-detection',content:'telephone=no'});
    this.meta.updateTag({name:'theme-color',content:"#212529"});
    this.meta.updateTag({name:'description',content:this.description});
  }
  ngAfterViewInit() {
    if (this.containers.nativeElement.childNodes.length === 0) {
        return false;
      }
    let draggable = new Draggable(this.containers.nativeElement, {
      draggable: '.PillSwitchControl',
      delay: 0,
    });
    let isToggled = false;
  let initialMousePosition;
  let containerRect;
  let dragRect;
  let dragThreshold;
  let headings;
  let headingText;
  // --- Draggable events --- //
  draggable.on('drag:start', (evt) => {
    initialMousePosition = {
      x: evt.sensorEvent.clientX,
      y: evt.sensorEvent.clientY,
    };
  });

  draggable.on('mirror:created', (evt) => {
      containerRect = evt.sourceContainer.getBoundingClientRect();
      dragRect = evt.source.getBoundingClientRect();

      const containerRectQuarter = containerRect.width / 4;
      dragThreshold = isToggled ? containerRectQuarter * -1 : containerRectQuarter;
      headings = {
        source: evt.originalSource.querySelector('[data-switch-on]'),
        mirror: evt.mirror.querySelector('[data-switch-on]'),
      };
      headingText = {
        on: headings.source.dataset.switchOn,
        off: headings.source.dataset.switchOff,
      };
    });
    draggable.on('mirror:move', (evt) => {
        // Required to help restrict the draggable element to the container
        evt.cancel();

        // We do not want to use `getBoundingClientRect` while dragging,
        // as that would be very expensive.
        // Instead, we look at the mouse position, which we can ballpark as being
        // close to the center of the draggable element.
        // We need to look at both the X and Y offset and determine which is the higher number.
        // That way we can drag outside of the container and still have the
        // draggable element move appropriately.
        const offsetX = this.calcOffset(evt.sensorEvent.clientX - initialMousePosition.x);
        const offsetY = this.calcOffset(initialMousePosition.y - evt.sensorEvent.clientY);
        const offsetValue = offsetX > offsetY ? offsetX : offsetY;
        const mirrorCoords = {
          top: dragRect.top - offsetValue,
          left: dragRect.left + offsetValue,
        };

        this.translateMirror(evt.mirror, mirrorCoords, containerRect);

        if (isToggled && offsetValue < dragThreshold) {
          evt.sourceContainer.classList.remove(this.toggleClass);
          headings.source.textContent = headingText.off;
          headings.mirror.textContent = headingText.off;
          isToggled = false;
        } else if (!isToggled && offsetValue > dragThreshold) {
          evt.sourceContainer.classList.add(this.toggleClass);
          headings.source.textContent = headingText.on;
          headings.mirror.textContent = headingText.on;
          isToggled = true;
        }
      });
  }

  translateMirror(mirror, mirrorCoords, containerRect) {
  if (mirrorCoords.top < containerRect.top || mirrorCoords.left < containerRect.left) {
    return;
  }

  requestAnimationFrame(() => {
    mirror.style.transform = `translate3d(${mirrorCoords.left}px, ${mirrorCoords.top}px, 0)`;
  });
}

calcOffset(offset) {
  return offset * 2 * 0.5;
}
}

@NgModule({
  imports: [BrowserModule],
  declarations: [DocumentComponent,SidebarComponent],
  bootstrap: [DocumentComponent]
})
export class DocumentModule{

}

platformBrowserDynamic().bootstrapModule(DocumentModule);
