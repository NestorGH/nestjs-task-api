import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
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
      throw new NotFoundException(`Task with id, name or no "${id}" not found`);

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const pokemon = await this.findOne(id);

    // if (updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase()

    try {
      await pokemon.updateOne(updateTaskDto);
      return { ...pokemon.toJSON(), ...updateTaskDto };
    } catch (error) {
      this.handleException(error);
    }
  }

  async remove(id: string) {
    const task = await this.findOne(id);

    try {
      if (!task) {
        throw new NotFoundException(
          `Task with id, name or no "${id}" not found`,
        );
      } else {
        await this.taskModel.findByIdAndDelete(id);
      }
    } catch (error) {
      this.handleException(error);
    }
  }

  private handleException(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Task already exists. ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.log(error);
    throw new InternalServerErrorException(
      `Can't create task - check server logs`,
    );
  }
}
