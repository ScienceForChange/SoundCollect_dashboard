import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-slider-step',
  templateUrl: './slider-step.component.html',
  styleUrl: './slider-step.component.scss'
})
export class SliderStepComponent {
  //
  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    const sliderElement = this.el.nativeElement.querySelector('[ng-reflect-step]');
    
    if (sliderElement) {
      const stepValue = parseInt(sliderElement.getAttribute('ng-reflect-step'), 10);
      const minValue = parseInt(sliderElement.getAttribute('ng-reflect-min'), 10);
      const maxValue = parseInt(sliderElement.getAttribute('ng-reflect-max'), 10);
      
      this.createStepMarkers(minValue, maxValue, stepValue);
    }
  }

  createStepMarkers(min: number, max: number, step: number): void {
    const numberOfSteps = (max - min) / step;
    const slider = this.el.nativeElement.querySelector('.p-slider');
    
    for (let i = 0; i <= numberOfSteps; i++) {
      const marker = document.createElement('div');
      marker.classList.add('step-marker');
      marker.style.position = 'absolute';
      const position = (i * step / (max - min)) * 100;
      if(position === 0) marker.style.left = '0.143rem'
      if(position === 100) marker.style.left = 'calc(100% - 0.143rem)'
      if(position !== 0 && position !== 100) marker.style.left = `${position}%`;
      
      slider.appendChild(marker);
    }
  }
}
