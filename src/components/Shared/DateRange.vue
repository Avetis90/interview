<template>
    <div class="date-range">
        <div class="ml-3">
            <v-text-field
                    v-model="formattedDate"
                    name="startDate"
                    class="date-range__pickers-input"
                    :prepend-icon="prependIcon"
                    readonly
                    @click="dateVisible = true"
            />
        </div>
        <div class="date-range__pickers">
            <div class="date-range__picker">
                <v-date-picker
                    :next-icon="nextIcon"
                    :prev-icon="prevIcon"
                    :dark="dark"
                    :events="highlightRange ? dateRange.dates : events"
                    :event-color="highlightRange ? dateRange.colors : eventColor"
                    v-model="startDate"
                    :min="options.minDate"
                    :max="endDate"
                    :locale="locale"
                    :first-day-of-week="firstDayOfWeek"
                    no-title
                    @change="onDateRangeChange"
                    v-if="dateVisible"
                />
                <v-date-picker
                    :next-icon="nextIcon"
                    :prev-icon="prevIcon"
                    :dark="dark"
                    :min="startDate"
                    :max="maxDate"
                    :events="highlightRange ? dateRange.dates : events"
                    :event-color="highlightRange ? dateRange.colors : eventColor"
                    v-model="endDate"
                    :locale="locale"
                    :first-day-of-week="firstDayOfWeek"
                    no-title
                    @change="onDateRangeChange"
                    v-if="dateVisible"
                />
            </div>
            <div
                    v-if="!noPresets"
                    class="date-range__presets"
            >
                <v-list :dark="dark" v-if="dateVisible">
                    <v-subheader>{{ labels.preset }}</v-subheader>
                    <v-list-tile
                            v-for="(preset, index) in presets"
                            v-model="isPresetActive[index]"
                            :key="index"
                            @click="onPresetSelect(index)"
                    >
                        <v-list-tile-content>
                            {{ preset.label }}
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile>
                        <v-list-tile-content>
                            <div>
                                <v-btn class="mr-1" color="success" @click.stop="apply">Apply</v-btn>
                                <v-btn @click="onCancel">Cancel</v-btn>
                            </div>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </div>
        </div>
    </div>
</template>

<script>
  import { format, parse, subDays } from 'date-fns'

  export default {
    name: 'v-daterange',
    props: {
      options: {
        type: Object,
        required: true
      },
      range: {
        type: Array,
        default: [
          format(subDays(new Date(), 30), 'YYYY-MM-DD'),
          format(subDays(new Date(), 1), 'YYYY-MM-DD')
        ]
      },
      noPresets: {
        type: Boolean,
        default: false
      },
      dark: {
        type: Boolean,
        default: false
      },
      prependIcon: {
        type: String,
        default: 'event'
      },
      nextIcon: {
        type: String,
        default: 'chevron_right'
      },
      prevIcon: {
        type: String,
        default: 'chevron_left'
      },
      labels: {
        type: Object,
        default () {
          return {
            start: 'Start Date',
            end: 'End Date',
            preset: 'Presets'
          }
        }
      },
      events: {
        type: [Array, Object, Function],
        default: () => null
      },
      eventColor: {
        type: [String, Function, Object],
        default: 'warning'
      },
      highlightRange: {
        type: Boolean,
        default: true
      },
      highlightColors: {
        type: String,
        default: ''
      },
      locale: {
        type: String,
        default: 'en-us'
      },
      firstDayOfWeek: {
        type: Number,
        default: 0
      }
    },
    data () {
      return {
        startDate: this.range[0],
        endDate: this.range[1],
        format: this.options.format,
        presets: this.options.presets,
        dateRange: {
          dates: [],
          colors: {}
        },
        dateVisible: false,
        formattedDate: format(parse(this.range[0]), this.options.format) + ' ~ ' + format(parse(this.range[1]), this.options.format)
      }
    },
    computed: {
      highlightColorClasses () {
        if (this.highlightColors) {
          return this.highlightColors
        }
        return this.dark ? 'blue-grey darken-1' : 'blue lighten-5'
      },
      isPresetActive () {
        return this.presets.map(
          preset =>
            preset.range[0] === this.startDate && preset.range[1] === this.endDate
        )
      },
      today () {
        return format(new Date(), 'YYYY-MM-DD')
      },
      maxDate () {
        return this.options.maxDate || this.today
      }
    },
    mounted () {
      if (this.highlightRange) this.setInRangeData()
    },
    methods: {
      apply () {
        this.$emit('input', [this.startDate, this.endDate])
        this.dateVisible = false
      },
      onCancel () {
        this.startDate = this.range[0]
        this.endDate = this.range[1]
        this.formattedDate = format(parse(this.range[0]), this.format) + ' ~ ' + format(parse(this.range[1]), this.format)
        if (this.highlightRange) this.setInRangeData()
        this.dateVisible = false
      },
      onPresetSelect (presetIndex) {
        this.formattedDate = this.presets[presetIndex].label
        this.startDate = this.presets[presetIndex].range[0]
        this.endDate = this.presets[presetIndex].range[1]
        if (this.highlightRange) this.setInRangeData()
      },
      onDateRangeChange () {
        this.formattedDate = format(parse(this.startDate), this.format) + ' ~ ' + format(parse(this.endDate), this.format)
        if (this.highlightRange) this.setInRangeData()
      },
      setInRangeData () {
        const inRangeData = {
          dates: [],
          colors: {}
        }

        if (this.highlightRange) {
          const startDate = parse(this.startDate)
          const endDate = parse(this.endDate)
          const diffDays = (endDate - startDate) / (1000 * 3600 * 24)

          for (let i = 0; i <= diffDays; i += 1) {
            const date = this.addDays(startDate.toDateString(), i)
            inRangeData.dates.push(date)
            inRangeData.colors[date] = `date-range__date-in-range ${
              this.highlightColorClasses
              }`

            if (i === 0) inRangeData.colors[date] += ' date-range__range-start'
            if (i === diffDays) {
              inRangeData.colors[date] += ' date-range__range-end'
            }
          }
        }

        this.dateRange = inRangeData
      },
      addDays (date, days) {
        const result = parse(date)
        result.setDate(result.getDate() + days)
        return format(result, 'YYYY-MM-DD')
      }
    }
  }
</script>

<style scoped>
    .date-range__presets {
        margin-left: 1rem;
        min-width: 230px;
    }

    .date-range__pickers-input {
        width: 225px;
    }

    .date-range__pickers {
        display: flex;
    }

    .date-range__picker {
        padding: 0 1rem;
    }
    .date-range >>> .date-picker-table table, .date-range >>> .v-date-picker-table table {
        border-collapse: collapse;
    }
    .date-range >>> .date-picker-table__event.date-range__date-in-range, .date-range >>> .v-date-picker-table__event.date-range__date-in-range {
        z-index: 0;
        /* override existing settings */
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        bottom: 0;
        border-radius: 0;
    }
    .date-range
    >>> .date-picker-table__event.date-range__date-in-range.date-range__range-start,
    .date-range
    >>> .v-date-picker-table__event.date-range__date-in-range.date-range__range-start {
        border-top-left-radius: 50%;
        border-bottom-left-radius: 50%;
        /* Cover only date button */
        left: 7px;
        width: 31px;
    }
    .date-range
    >>> .date-picker-table__event.date-range__date-in-range.date-range__range-end,
    .date-range
    >>> .v-date-picker-table__event.date-range__date-in-range.date-range__range-end {
        border-top-right-radius: 50%;
        border-bottom-right-radius: 50%;
    }
    .date-range >>> .date-picker-table .btn, .date-range >>> .v-date-picker-table .v-btn {
        /* fixed zIndex is needed because .date-picker-table__event div is created after the .btn button */
        z-index: 1;
    }
</style>
