<template>
  <div class="bg-base">
    <div class="container glass mx-auto rounded-xl">
      <div class="flex flex-wrap">
        <div class="shrink-0 bg-indigo-100 p-2 text-black">
          <div v-if="jobs" v-for="job of jobs" class="mb-2 space-x-2">
            <span class="bg-indigo-300 px-2 py-1 rounded">{{ job.jobId }}</span>
            <span class="bg-indigo-300 px-2 py-1 rounded">{{ job.status }}</span>
            <button
              class="bg-indigo-200 px-2 py-1 rounded hover:bg-indigo-500"
              @click="selectJob(job)"
            >선택</button>
          </div>
        </div>
        <div class="shrink-0 border">
          <canvas id="canvas" width="800" height="640" class="border"></canvas>
          <div>Image Scale: {{ currentJob.image && currentJob.image.scaleX }}</div>
          <div>Image width: {{ currentJob.image && currentJob.image.width }}</div>
        </div>
        <div class="shrink-0 p-2 text-black">
          <div
            @click="selectAnnotation(a)"
            v-if="currentJob"
            v-for="a of currentJob.annotations"
            class="space-x-1 p-1 cursor-pointer"
          >
            <span v-if="a.status === 'none'">😡</span>
            <span v-else>😀</span>

            <span class>{{ a.annotationId }}</span>
            <span class="bg-green-100 p-1 rounded">{{ a.status }}</span>
            <select
              @change="onAnnotationChange(a)"
              v-model="a.status"
              class="text-black p-1 rounded"
            >
              <option value="fresh">fresh</option>
              <option value="crack">crack</option>
            </select>
            <!-- <button @click="selectAnnotation(a)">선택</button> -->
            <span v-if="currentJob.currentAnnotationId === a.annotationId">💡</span>
          </div>
          <button @click="saveJob" class="bg-indigo-200 px-2 hover:bg-indigo-500">저장</button>
        </div>
      </div>
      <div class="p-2">
        <button class="btn btn-blue" @click="addAnnotation">add</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { fabric } from "fabric";
import jobService from '../service/job-service'
import plugin from '../fabric-plugin'


let canvas
let jobs = ref(null)
let currentJob = ref({})


plugin.installDeleteControl(fabric, (annotationId) => {
  const { annotations } = currentJob.value

  const idx = annotations.findIndex(
    ant => ant.annotationId === annotationId
  )
  if (idx >= 0) {
    annotations.splice(idx, 1)
  }
})

onMounted(async () => {
  canvas = new fabric.Canvas('canvas');
  jobs.value = await jobService.getJobs()
})

const JobStatus = {
  READY: 'ready',
  FINISHED: 'finished',
  CONFIRMED: 'confrimed',
  REJECTED: 'rejected',
}

const EggStatus = {
  NONE: 'none',
  FRESH: 'fresh',
  CRACK: 'crack'
}

const findBox = (annotationId) => canvas.getObjects().find(obj => obj.annotationId === annotationId)

function selectAnnotation(annotation) {
  const box = findBox(annotation.annotationId)
  canvas.setActiveObject(box)
  canvas.requestRenderAll();
}

function onAnnotationChange(annotation) {
  const box = findBox(annotation.annotationId)
  const text = box?.getObjects()?.[1]
  if (text) {
    text.set('text', annotation.status)
  } else {
    alert('text is not existed')
  }
  canvas.requestRenderAll();
}

function saveJob() {
  const json = canvas.toDatalessJSON(['id', 'status', 'jobId', 'annotationId'])
  currentJob.value.json = json
  currentJob.value.status = JobStatus.FINISHED
}

function addAnnotation() {
  const jobId = currentJob.value.jobId
  if (jobId) {
    const annotationId = `${jobId}-an-${currentJob.value.annotations.length + 1}`
    const box = makeBox(jobId, annotationId)
    canvas.setActiveObject(box);
    canvas.add(box)
    addAnnotationModel(box, jobId, annotationId)
  } else {
    alert('job is not selected')
  }
}

function addAnnotationModel(box, jobId, annotationId, status) {
  box.set('annotationId', annotationId)
  box.set('jobId', jobId)
  box.on('selected', () => {
    currentJob.value.currentAnnotationId = annotationId
  })
  currentJob.value.annotations.push(Annotation(jobId, annotationId, status))
}

function selectJob(job) {
  currentJob.value = job
  canvas.getObjects().forEach(box => {
    canvas.remove(box)
  })

  fabric.Image.fromURL(currentJob.value.img, function (img) {
    img.scaleToWidth(canvas.width);
    canvas.setBackgroundImage(img);
    canvas.requestRenderAll();

    currentJob.value.image = {
      scaleX: img.scaleX,
      width: img.width
    }
  });

  canvas.loadFromJSON(currentJob.value.json, () => {
    canvas.renderAll()
    const boxes = canvas.getObjects()
    currentJob.value.annotations = []
    boxes.forEach(box => {
      const text = box?.getObjects()?.[1]
      console.log('status:', text)
      addAnnotationModel(box, box.jobId, box.annotationId, text.text)
    })
  })
}

function makeBox(groupId, annotationId, status = 'none') {
  // const rect = new fabric.Rect({
  //   width: 80,
  //   height: 100,
  //   fill: 'yellow',
  //   opacity: 0.2
  // });

  const rect = new fabric.Circle({
    radius: 70,
    fill: 'yellow',
    scaleY: 1.3,
    opacity: 0.4
  })

  const text = new fabric.Text(status, {
    fontSize: 30,
    left: 30,
    top: 20,
    fontSize: 20,
    originX: 'center',
    originY: 'center'
  });

  const group = new fabric.Group([rect, text], {
    left: 150,
    top: 100,
  });

  return group
}

function Annotation(jobId, annotationId, status = 'none') {
  return {
    jobId,
    annotationId,
    status
  }
}

</script>

<style>
.bg-base {
  @apply -mt-[4rem] flex flex-col bg-gradient-to-r from-green-400 to-blue-500 pt-32 pb-48 text-primary-content;
}
.btn {
  @apply font-bold py-1 px-2 rounded;
}
.btn-blue {
  @apply bg-blue-500 text-white;
}
.btn-blue:hover {
  @apply bg-blue-700;
}
</style>
