import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqTab {
  label: string;
  items: FaqItem[];
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [TranslateModule],
  host: { class: 'block w-full' },
  styles: `
    .hide-scrollbar {
      scrollbar-width: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `,
  template: `
    @if (tabs().length > 0) {
      <div class="w-full max-w-3xl mx-auto">
        <!-- Tabs -->
        <div class="flex gap-3 mb-10 overflow-x-auto pb-2 hide-scrollbar">
          @for (tab of tabs(); track tab.label; let i = $index) {
            <button
              type="button"
              [class]="
                'whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium transition-colors shrink-0 ' +
                (activeTab === i
                  ? 'bg-[#4f39f6] text-white'
                  : 'text-gray-500 bg-gray-100 hover:bg-gray-200')
              "
              (click)="selectTab(i)"
            >
              {{ tab.label | translate }}
            </button>
          }
        </div>

        <!-- Accordion -->
        <div class="flex flex-col gap-3">
          @for (
            item of tabs()[activeTab].items;
            track item.question;
            let i = $index
          ) {
            <div class="border border-gray-200 rounded-xl overflow-hidden">
              <button
                type="button"
                class="flex items-center justify-between w-full px-6 py-5 text-left transition-colors hover:bg-gray-50"
                [attr.aria-expanded]="openIndex === i"
                (click)="toggleItem(i)"
              >
                <span class="text-sm font-medium text-gray-950 pr-4">
                  {{ item.question | translate }}
                </span>
                <svg
                  class="w-5 h-5 shrink-0 text-gray-500 transition-transform duration-300"
                  [class.rotate-180]="openIndex === i"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                class="grid transition-all duration-300 ease-in-out"
                [style.grid-template-rows]="openIndex === i ? '1fr' : '0fr'"
              >
                <div class="overflow-hidden">
                  <p class="px-6 pb-5 text-sm leading-relaxed text-neutral-600">
                    {{ item.answer | translate }}
                  </p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class FaqComponent {
  tabs = input.required<FaqTab[]>();

  activeTab = 0;
  openIndex: number | null = null;

  selectTab(index: number): void {
    this.activeTab = index;
    this.openIndex = null;
  }

  toggleItem(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }
}
