import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './entities/task.entity';
import { Model, isValidObjectId } from 'mongoose';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    try {
      const newTask = new this.taskModel(createTaskDto);
      await newTask.save();
      return newTask;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Task already exist');
      }
      throw error;
    }
  }

  async findAll() {
    const task = await this.taskModel.find();
    return task;
  }

  async findOne(id: string) {
    let task: Task;

    if (!isNaN(+id)) {
      task = await this.taskModel.findOne({ id });
    }
    //MongoId
    if (!task && isValidObjectId(id)) task = await this.taskModel.findById(id);
    if (!task)
      throw new NotFoundException(
        `Task with id, name or no "${id}" not found`,
      );

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id)
    await this.taskModel.updateOne(updateTaskDto);
    return task
  }

  async remove(id: string) {
    let task: Task;

    if (!isNaN(+id)) {
      task = await this.taskModel.findOne({ id });
    }
    //MongoId
    if (!task && isValidObjectId(id)) task = await this.taskModel.findById(id);
    if (!task) {
      throw new NotFoundException(
        `Task with id, name or no "${id}" not found`,
      );
    } else {
      task = await this.taskModel.findByIdAndDelete(id)
    }
  }
  
}
